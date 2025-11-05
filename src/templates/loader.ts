import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';

/**
 * Compiled Handlebars templates
 */
export interface CompiledTemplates {
  operation: HandlebarsTemplateDelegate;
  document: HandlebarsTemplateDelegate;
  client: HandlebarsTemplateDelegate;
}

/**
 * Loads a template file from the templates directory
 * @param templateName - Name of the template file (e.g., 'operation.hbs')
 * @returns Template content as string
 * @throws Error if template file is not found
 */
export function loadTemplate(templateName: string): string {
  // After build, loader.js is in dist/templates/, and templates are in dist/templates/
  const templatePath = path.join(__dirname, templateName);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Compiles all Handlebars templates
 * @returns Compiled templates ready to use
 */
export function compileTemplates(): CompiledTemplates {
  const operationTemplateContent = loadTemplate('operation.hbs');
  const documentTemplateContent = loadTemplate('document.hbs');
  const clientTemplateContent = loadTemplate('client.hbs');

  return {
    operation: Handlebars.compile(operationTemplateContent),
    document: Handlebars.compile(documentTemplateContent),
    client: Handlebars.compile(clientTemplateContent),
  };
}
