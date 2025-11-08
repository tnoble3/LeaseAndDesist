describe('Core User Flow', () => {
  const testUser = {
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'Test123!'
  }

  it('should register -> login -> create challenge -> mark complete', () => {
    // Visit registration page
    cy.visit('/register', { timeout: 20000 })

    // Fill registration form
    cy.get('[data-testid="input-name"]', { timeout: 10000 }).type(testUser.name)
    cy.get('[data-testid="input-email"]', { timeout: 10000 }).type(testUser.email)
    cy.get('[data-testid="input-password"]', { timeout: 10000 }).type(testUser.password)

    // Intercept registration API
    cy.intercept('POST', '**/api/users/register').as('registerRequest')

    // Submit the form
    cy.get('[data-testid="register-form"]').submit()

    // Wait for API and log response
    cy.wait('@registerRequest', { timeout: 30000 }).then(interception => {
      cy.log('Register status:', interception.response?.statusCode)
      cy.log('Register body:', JSON.stringify(interception.response?.body))
      expect(interception.response?.statusCode).to.eq(201)
    })

    // Wait for dashboard redirect
    cy.url({ timeout: 20000 }).should('include', '/dashboard')

    // Go to Goals page to create challenge
    cy.visit('/goals', { timeout: 10000 })

    const testChallenge = {
      title: 'Test Challenge',
      description: 'This is a test challenge created by Cypress'
    }

    cy.get('[data-testid="input-title"]', { timeout: 10000 }).type(testChallenge.title)
    cy.get('[data-testid="input-description"]', { timeout: 10000 }).type(testChallenge.description)

    // Intercept create challenge API
    cy.intercept('POST', '**/api/challenges').as('createChallenge')

    // Submit challenge form
    cy.get('[data-testid="create-challenge-form"]').submit()
    cy.wait('@createChallenge', { timeout: 30000 }).then(interception => {
      cy.log('Create Challenge status:', interception.response?.statusCode)
      cy.log('Create Challenge body:', JSON.stringify(interception.response?.body))
      expect(interception.response?.statusCode).to.eq(201)
    })

    // Verify challenge appears and toggle complete
    cy.contains(testChallenge.title, { timeout: 10000 })
      .closest('[data-testid^="goal-"]')
      .within(() => {
        cy.get('[data-testid="btn-toggle"]', { timeout: 10000 }).click()
        cy.get('[data-testid="btn-toggle"]').contains('Mark Open')
      })

    // Check dashboard progress updates
    cy.visit('/dashboard', { timeout: 10000 })
    cy.get('[data-testid="progress-text"]', { timeout: 10000 })
      .should('contain', '1 / 1 challenges complete')
  })
})
