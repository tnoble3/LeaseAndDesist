describe('Core User Flow', () => {
  const testUser = {
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'Test123!'
  }

  it('should register -> login -> create challenge -> mark complete', () => {
    // Visit registration page
    cy.visit('/register', { timeout: 10000 })

    // Fill registration form
    cy.get('[data-testid="input-name"]', { timeout: 10000 }).type(testUser.name)
    cy.get('[data-testid="input-email"]', { timeout: 10000 }).type(testUser.email)
    cy.get('[data-testid="input-password"]', { timeout: 10000 }).type(testUser.password)
    
    // Intercept registration API
    cy.intercept('POST', '**/api/users/register').as('registerRequest')
    cy.get('[data-testid="register-form"]').submit()

    // Wait and log API response for debugging
    cy.wait('@registerRequest', { timeout: 30000 }).then(interception => {
      cy.log('Register status:', interception.response?.statusCode)
      cy.log('Register body:', JSON.stringify(interception.response?.body))
    })

    // After registration, the app may redirect to /login (not auto-login)
    cy.url({ timeout: 10000 }).should('include', '/login')

    // Log in manually
    cy.get('[data-testid="input-email"]').type(testUser.email)
    cy.get('[data-testid="input-password"]').type(testUser.password)
    cy.get('[data-testid="login-form"]').submit()

    // Verify we reached dashboard
    cy.url({ timeout: 10000 }).should('include', '/dashboard')

    // Create challenge
    cy.visit('/goals', { timeout: 10000 })
    const testChallenge = {
      title: 'Test Challenge',
      description: 'This is a test challenge created by Cypress'
    }
    
    cy.get('[data-testid="input-title"]', { timeout: 10000 }).type(testChallenge.title)
    cy.get('[data-testid="input-description"]', { timeout: 10000 }).type(testChallenge.description)
    cy.intercept('POST', '**/api/challenges').as('createChallenge')
    cy.get('[data-testid="create-challenge-form"]').submit()
    cy.wait('@createChallenge', { timeout: 30000 })

    // Mark challenge complete
    cy.contains(testChallenge.title, { timeout: 10000 })
      .closest('[data-testid^="goal-"]')
      .within(() => {
        cy.get('[data-testid="btn-toggle"]', { timeout: 10000 }).click()
        cy.get('[data-testid="btn-toggle"]', { timeout: 10000 }).contains('Mark Open')
      })

    // Check dashboard progress
    cy.visit('/dashboard', { timeout: 10000 })
    cy.get('[data-testid="progress-text"]', { timeout: 10000 })
      .should('contain', '1 / 1 challenges complete')
  })
})
