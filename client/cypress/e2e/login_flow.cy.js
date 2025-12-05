describe('Login and create flow', () => {
  const rand = Math.floor(Math.random()*100000)
  const email = `cy${rand}@example.com`
  const password = 'Password1!'
  it('registers, logs in, creates goal & challenge, marks complete and verifies dashboard progress', () => {
    const goalTitle = `E2E Goal ${rand}`
    const challengeTitle = `E2E Challenge ${rand}`

  // register and login
  cy.visit('/login')
  cy.get('[data-cy=auth-switch]').click()
  cy.get('[data-cy=auth-name]').type('Cypress User')
  cy.get('[data-cy=auth-email]').type(email)
  cy.get('[data-cy=auth-password]').type(password)
  cy.get('[data-cy=auth-submit]').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard')

    // create a goal
  cy.visit('/goals')
  cy.get('[data-cy=goal-title-input]').type(goalTitle)
  cy.get('[data-cy=goal-create-btn]').click()
  cy.contains(goalTitle).should('exist')

    // create a challenge for the goal
  cy.visit('/challenges')
  cy.get('[data-cy=challenge-goal-select]').select(goalTitle)
  cy.get('[data-cy=challenge-title-input]').type(challengeTitle)
  cy.get('[data-cy=challenge-create-btn]').click()
  cy.contains(challengeTitle).should('exist')

    // mark complete — scope to the nearest list item and allow extra time for UI update
    cy.contains(challengeTitle, { timeout: 10000 }).should('be.visible')
    cy.contains(challengeTitle).closest('[data-cy=challenge-card]').within(() => {
      cy.get('[data-cy=challenge-complete-btn]', { timeout: 10000 }).click()
      cy.get('[data-cy=challenge-complete-btn]', { timeout: 10000 }).should('contain', 'Undo')
    })

    // verify dashboard progress
  cy.visit('/dashboard')
  cy.get('[data-cy=dashboard-stats]').should('contain', '100% complete')
  cy.get('[data-cy=dashboard-stats]').should('contain', '(1/1)')
  })
})
