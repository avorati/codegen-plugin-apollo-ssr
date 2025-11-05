import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/plugin';

describe('GraphQL Codegen Apollo SSR Plugin - Fragment collisions', () => {
  const schema = buildSchema(`
    type Media { id: ID!, url: String! }
    type Query { hero: Media, menu: Media }
  `);

  it('auto-renames duplicate fragment names per file (default config)', () => {
    const home = parse(`
      fragment Media on Media { id url }
      query HomeQuery { hero { ...Media } }
    `);

    const menu = parse(`
      fragment Media on Media { id url }
      query MenuQuery { menu { ...Media } }
    `);

    const result = plugin(
      schema,
      [
        { document: home, location: 'src/graphql/home.graphql' },
        { document: menu, location: 'src/graphql/menu.graphql' },
      ],
      {}
    );

    // Expect namespaced fragments
    expect(result).toContain('fragment Home_Media');
    expect(result).toContain('fragment Menu_Media');
    // Spreads should be updated locally
    expect(result).toContain('...Home_Media');
    expect(result).toContain('...Menu_Media');
  });

  it('resolves same basename via namespaceDepth=2', () => {
    const a = parse(`
      fragment Cta on Media { id }
      query AQuery { hero { ...Cta } }
    `);
    const b = parse(`
      fragment Cta on Media { id }
      query BQuery { menu { ...Cta } }
    `);

    const result = plugin(
      schema,
      [
        { document: a, location: 'feature/home.graphql' },
        { document: b, location: 'pages/home.graphql' },
      ],
      { fragmentNamespace: 'file', onNameCollision: 'rename', namespaceDepth: 2 }
    );

    expect(result).toContain('fragment Feature_Home_Cta');
    expect(result).toContain('fragment Pages_Home_Cta');
    expect(result).toContain('...Feature_Home_Cta');
    expect(result).toContain('...Pages_Home_Cta');
  });

  it('throws a clear error in error mode', () => {
    const d1 = parse(`
      fragment Media on Media { id }
    `);
    const d2 = parse(`
      fragment Media on Media { id }
    `);

    expect(() =>
      plugin(
        schema,
        [
          { document: d1, location: 'a.graphql' },
          { document: d2, location: 'b.graphql' },
        ],
        { onNameCollision: 'error', fragmentNamespace: 'none' }
      )
    ).toThrow('Not all fragments have an unique name:');
  });
});
