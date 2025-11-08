describe('Core User Flow', () => {
  const testUser = {
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'Test123!'
  }

  it('should register -> login -> create challenge -> mark complete', () => {
  // Register
  cy.visit('/register')
  cy.get('[data-testid="input-name"]').type(testUser.name)
  cy.get('[data-testid="input-email"]').type(testUser.email)
  cy.get('[data-testid="input-password"]').type(testUser.password)
  cy.get('[data-testid="register-form"]').submit()

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')

    // Create challenge
  cy.visit('/goals')
    const testChallenge = {
      title: 'Test Challenge',
      description: 'This is a test challenge created by Cypress'
    }
  cy.get('[data-testid="input-title"]').type(testChallenge.title)
  cy.get('[data-testid="input-description"]').type(testChallenge.description)
  cy.get('[data-testid="create-challenge-form"]').submit()

    // Verify challenge appears and can be marked complete
    cy.contains(testChallenge.title)
      .closest('[data-testid^="goal-"]')
      .within(() => {
        cy.get('[data-testid="btn-toggle"]').click()
        cy.get('[data-testid="btn-toggle"]').contains('Mark Open')
      })

    // Check dashboard shows progress
  cy.visit('/dashboard')
  cy.get('[data-testid="progress-text"]').should('contain', '1 / 1 challenges complete')
  })
})