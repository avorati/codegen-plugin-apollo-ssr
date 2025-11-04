import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/plugin';

describe('GraphQL Codegen Apollo SSR Plugin - Strapi Project Scenarios', () => {
  const schema = buildSchema(`
    type UploadFile {
      url: String!
      alternativeText: String
      mime: String
      formats: String
    }

    type ComponentMenuOptionsPage {
      id: ID!
      label: String!
      page_route: PageRoute
    }

    type PageRoute {
      route: String
      page: Page
    }

    type Page {
      identificador: String
      pagina: String
    }

    type ComponentMenuOptionsCustomLink {
      id: ID!
      label: String!
      url: String!
    }

    type ComponentSharedCta {
      id: ID!
      ctaOption: CtaOption
    }

    union CtaOption = ComponentMenuOptionsPage | ComponentMenuOptionsCustomLink

    type Category {
      documentId: ID!
      nome: String
      slug: String
      cor: String
      createdAt: String
      updatedAt: String
      publishedAt: String
    }

    type NewsPage {
      documentId: ID!
      titulo: String
      slug: String
      categoria: Category
      imagem_principal: UploadFile
      destaque: Boolean
      conteudo: String
      createdAt: String
      updatedAt: String
      publishedAt: String
    }

    type SearchResult {
      pagination: Pagination
      results: [SearchItem!]!
    }

    type Pagination {
      page: Int
      pageSize: Int
      pageCount: Int
      total: Int
    }

    type SearchItem {
      id: ID!
      title: String
      image: UploadFile
      description: String
      breadcumbs: [Breadcrumb!]
      previewButton: Boolean
    }

    type Breadcrumb {
      label: String
      path: String
    }

    scalar I18NLocaleCode
    scalar PublicationStatus
    scalar NewsPageFiltersInput
    scalar ServiceItemFiltersInput
    scalar PaginationArg

    type Query {
      categories(locale: I18NLocaleCode, status: PublicationStatus): [Category!]!
      newsPages(locale: I18NLocaleCode, filters: NewsPageFiltersInput, status: PublicationStatus, sort: String): [NewsPage!]!
      newsPage(locale: I18NLocaleCode, documentId: ID!, status: PublicationStatus): NewsPage
      searchResult(search: String, status: PublicationStatus, locale: I18NLocaleCode): SearchResult
      homePage(locale: I18NLocaleCode, status: PublicationStatus): HomePage
      menu(locale: I18NLocaleCode, status: PublicationStatus): Menu
      serviceItems(filters: ServiceItemFiltersInput, locale: I18NLocaleCode, status: PublicationStatus, pagination: PaginationArg, sort: [String]): [ServiceItem!]!
    }

    type HomePage {
      documentId: ID!
      sections: [HomePageSection!]
    }

    union HomePageSection = ComponentHomeComponentsHero

    type ComponentHomeComponentsHero {
      title: String
      subtitle: String
      background: UploadFile
      cta: ComponentSharedCta
    }

    type Menu {
      documentId: ID!
      topbarOptions: [MenuOption!]
      options: [MenuOption!]
    }

    union MenuOption = ComponentMenuOptionsPage | ComponentMenuOptionsCustomLink | ComponentMenuOptionsSubmenu

    type ComponentMenuOptionsSubmenu {
      id: ID!
      label: String!
      page_route: PageRoute
      submenuItems: [ComponentMenuOptionsSubmenuItem!]
    }

    type ComponentMenuOptionsSubmenuItem {
      id: ID!
      label: String!
      page_route: PageRoute
    }

    type ServiceItem {
      documentId: ID!
      hero: ComponentSharedHeroWl
      createdAt: String
      updatedAt: String
      publishedAt: String
    }

    type ComponentSharedHeroWl {
      __typename: String
      id: ID!
      background: UploadFile
      subtitle: String
      description: String
    }
  `);

  describe('Categories query (category.graphql)', () => {
    it('should handle Categories query with variables', () => {
      const document = parse(`
        query Categories($locale: I18NLocaleCode, $status: PublicationStatus) {
          categories(locale: $locale, status: $status) {
            documentId
            nome
            slug
            cor
            createdAt
            updatedAt
            publishedAt
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'category.graphql' }], {});

      expect(result).toContain('export const CategoriesDocument = gql');
      expect(result).toContain('async getCategories');
      expect(result).toContain('CategoriesQuery');
      expect(result).toContain('CategoriesQueryVariables');
    });
  });

  describe('Homepage query with complex fragments (homepage.graphql)', () => {
    it('should handle complex nested fragments', () => {
      const document = parse(`
        fragment MediaFields on UploadFile {
          alternativeText
          url
          mime
          formats
        }

        fragment PageRouter on ComponentMenuOptionsPage {
          id
          label
          page_route {
            route
            page {
              identificador
              pagina
            }
          }
        }

        fragment CustomLink on ComponentMenuOptionsCustomLink {
          id
          label
          url
        }

        fragment CTAFields on ComponentSharedCta {
          id
          ctaOption {
            ...PageRouter
            ...CustomLink
          }
        }

        query HomePage($locale: I18NLocaleCode, $status: PublicationStatus) {
          homePage(locale: $locale, status: $status) {
            sections {
              __typename
              ... on ComponentHomeComponentsHero {
                heroTitle: title
                subtitle
                heroBackground: background {
                  ...MediaFields
                }
                cta {
                  ...CTAFields
                }
              }
            }
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'homepage.graphql' }], {});

      // Should include all fragments
      expect(result).toContain('fragment MediaFields');
      expect(result).toContain('fragment PageRouter');
      expect(result).toContain('fragment CustomLink');
      expect(result).toContain('fragment CTAFields');

      // Should include fragments recursively (CTAFields uses PageRouter and CustomLink)
      expect(result).toContain('...PageRouter');
      expect(result).toContain('...CustomLink');

      // Should generate correct query
      expect(result).toContain('export const HomePageDocument = gql');
      expect(result).toContain('async getHomePage');
      expect(result).toContain('HomePageQuery');
      expect(result).toContain('HomePageQueryVariables');
    });
  });

  describe('News queries (news.graphql)', () => {
    it('should handle multiple queries in same file', () => {
      const document = parse(`
        fragment MediaFields on UploadFile {
          alternativeText
          url
          mime
          formats
        }

        query NewsPages(
          $locale: I18NLocaleCode
          $filters: NewsPageFiltersInput
          $status: PublicationStatus
        ) {
          newsPages(
            locale: $locale
            sort: "createdAt:desc"
            filters: $filters
            status: $status
          ) {
            documentId
            titulo
            slug
            categoria {
              documentId
              nome
              slug
            }
            imagem_principal {
              ...MediaFields
            }
            destaque
            conteudo
          }
        }

        query NewsPage(
          $locale: I18NLocaleCode
          $documentId: ID!
          $status: PublicationStatus
        ) {
          newsPage(locale: $locale, documentId: $documentId, status: $status) {
            documentId
            titulo
            slug
            categoria {
              documentId
              nome
            }
            imagem_principal {
              ...MediaFields
            }
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'news.graphql' }], {});

      // Should generate both queries
      expect(result).toContain('export const NewsPagesDocument = gql');
      expect(result).toContain('async getNewsPages');
      expect(result).toContain('NewsPagesQuery');
      expect(result).toContain('NewsPagesQueryVariables');

      expect(result).toContain('export const NewsPageDocument = gql');
      expect(result).toContain('async getNewsPage');
      expect(result).toContain('NewsPageQuery');
      expect(result).toContain('NewsPageQueryVariables');

      // Should include fragment in both
      expect(result).toContain('fragment MediaFields');
    });
  });

  describe('Search query (search.graphql)', () => {
    it('should handle SearchResult query with complex variables', () => {
      const document = parse(`
        query SearchResult(
          $search: String
          $status: PublicationStatus
          $locale: I18NLocaleCode
        ) {
          searchResult(search: $search, status: $status, locale: $locale) {
            pagination {
              page
              pageSize
              pageCount
              total
            }
            results {
              id
              title
              image {
                url
                alternativeText
                width
                height
              }
              description
              breadcumbs {
                label
                path
              }
              previewButton
            }
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'search.graphql' }], {});

      expect(result).toContain('export const SearchResultDocument = gql');
      expect(result).toContain('async getSearchResult');
      expect(result).toContain('SearchResultQuery');
      expect(result).toContain('SearchResultQueryVariables');
    });
  });

  describe('Menus query (menus.graphql)', () => {
    it('should handle menus query with inline fragments and nested fragments', () => {
      const document = parse(`
        fragment MenuSubmenuItem on ComponentMenuOptionsSubmenuItem {
          id
          submenuItemLabel: label
          submenuItemRoute: page_route {
            route
            page {
              identificador
              pagina
            }
          }
        }

        fragment MenuSubmenu on ComponentMenuOptionsSubmenu {
          id
          submenuLabel: label
          submenuRoute: page_route {
            route
            page {
              identificador
              pagina
            }
          }
          submenuItems {
            ...MenuSubmenuItem
          }
        }

        query Menus($locale: I18NLocaleCode, $status: PublicationStatus) {
          menu(locale: $locale, status: $status) {
            id: documentId
            topbarOptions {
              ... on ComponentMenuOptionsPage {
                id
                label
                page_route {
                  route
                  page {
                    identificador
                    pagina
                  }
                }
              }
              ... on ComponentMenuOptionsCustomLink {
                id
                label
                url
              }
            }
            options {
              ... on ComponentMenuOptionsSubmenu {
                ...MenuSubmenu
              }
            }
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'menus.graphql' }], {});

      expect(result).toContain('export const MenusDocument = gql');
      expect(result).toContain('async getMenus');
      expect(result).toContain('MenusQuery');
      expect(result).toContain('MenusQueryVariables');

      // Should include nested fragments
      expect(result).toContain('fragment MenuSubmenu');
      expect(result).toContain('fragment MenuSubmenuItem');
      expect(result).toContain('...MenuSubmenuItem');
    });
  });

  describe('Services query (services.graphql)', () => {
    it('should handle services query with deeply nested fragments', () => {
      const document = parse(`
        fragment MediaFields on UploadFile {
          alternativeText
          url
          mime
          formats
        }

        fragment PageRouter on ComponentMenuOptionsPage {
          id
          label
          page_route {
            route
            page {
              identificador
              pagina
            }
          }
        }

        fragment CustomLink on ComponentMenuOptionsCustomLink {
          id
          label
          url
        }

        fragment CTAFields on ComponentSharedCta {
          id
          ctaOption {
            ...PageRouter
            ...CustomLink
          }
        }

        fragment HeroWLSectionFields on ComponentSharedHeroWl {
          __typename
          id
          background {
            ...MediaFields
          }
          subtitle
          description
        }

        query ServiceItems(
          $filter: ServiceItemFiltersInput
          $locale: I18NLocaleCode
          $status: PublicationStatus
          $pagination: PaginationArg
          $sort: [String]
        ) {
          serviceItems(
            filters: $filter
            locale: $locale
            status: $status
            pagination: $pagination
            sort: $sort
          ) {
            documentId
            hero {
              ...HeroWLSectionFields
            }
            createdAt
            updatedAt
            publishedAt
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'services.graphql' }], {});

      expect(result).toContain('export const ServiceItemsDocument = gql');
      expect(result).toContain('async getServiceItems');
      expect(result).toContain('ServiceItemsQuery');
      expect(result).toContain('ServiceItemsQueryVariables');

      // Should include all fragments recursively
      expect(result).toContain('fragment MediaFields');
      expect(result).toContain('fragment HeroWLSectionFields');
      expect(result).toContain('...MediaFields');
    });
  });

  describe('Query with multiple optional variables', () => {
    it('should handle query with multiple optional variables', () => {
      const document = parse(`
        query HomePageId($locale: I18NLocaleCode, $status: PublicationStatus) {
          homePage(locale: $locale, status: $status) {
            documentId
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('export const HomePageIdDocument = gql');
      expect(result).toContain('async getHomePageId');
      expect(result).toContain('HomePageIdQuery');
      expect(result).toContain('HomePageIdQueryVariables');
    });
  });
});
