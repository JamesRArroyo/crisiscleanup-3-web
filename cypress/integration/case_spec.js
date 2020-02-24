/**
 *
 * Tests for New Cases
 *
 * Cypress
 */

describe('New Case', () => {
  beforeEach(cy.login);
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false;
    });

    cy.server();
    cy.route({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/worksites?incident=*`,
    }).as('apiIncident');
    cy.route({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/worksites/*`,
    }).as('getWorksite');
    cy.route({
      method: 'POST',
      url: `${Cypress.env('API_URL')}/worksites`,
    }).as('createWorksite');
    cy.route({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/worksites?id__in=*`,
    }).as('printWorksite');

    cy.visit('/incident/158/cases/new');
    cy.wait('@apiIncident');
    cy.contains('New Case').should('be.visible');
  });
  beforeEach(() => {
    cy.get('.js-worksite-name').as('WorksiteName');
    cy.get('.js-worksite-address').as('WorksiteAddress');
    cy.get('.js-worksite-city').as('WorksiteCity');
    cy.get('.js-worksite-county').as('WorksiteCounty');
    cy.get('.js-worksite-county ~ div .js-break-glass').as(
      'WorksiteCountyBreakGlass',
    );
    cy.get('.js-worksite-state').as('WorksiteState');
    cy.get('.js-worksite-postal-code').as('WorksitePostalCode');
    cy.get('.js-save').as('WorksiteSave');
  });

  it('Creates new case successfully', () => {
    cy.get('@WorksiteName').type('Test Person');
    cy.get('@WorksiteAddress').type('455 N Rexford Drive');
    cy.get('@WorksiteCity').type('Beverly Hills');
    cy.get('@WorksiteCountyBreakGlass').click();
    cy.get('@WorksiteCounty').should('have.value', 'Los Angeles County');
    cy.get('@WorksiteState').should('have.value', 'California');
    cy.get('@WorksitePostalCode').should('have.value', '90210');
    cy.get('@WorksiteSave').click();
    cy.wait('@createWorksite');
    cy.url().should('include', '/incident/158/cases');
    cy.get('.js-actions-done').should('be.visible');
  });
});
