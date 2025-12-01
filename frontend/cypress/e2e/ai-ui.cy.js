describe('AI UI flows (frontend)', () => {
  const apiRequest = (method, url, body) =>
    cy.request({ method, url, body, failOnStatusCode: false });

  it('can open modal, generate challenge, and submit for feedback', () => {
    const username = `cypress_ui_${Date.now()}`;
    const user = {
      firstName: 'Cypress',
      lastName: 'UI',
      username,
      email: `${username}@example.com`,
      password: 'supersecret',
      confirmPassword: 'supersecret',
    };

    apiRequest('POST', '/api/users/register', user).then((resp) => {
      expect(resp.status).to.eq(201);

      apiRequest('POST', '/api/users/login', { username: user.username, password: user.password }).then((loginResp) => {
        expect(loginResp.status).to.eq(200);
        const token = loginResp.body.token;
        const demoUser = loginResp.body.user || { username, firstName: user.firstName, lastName: user.lastName };

        // set localStorage so frontend will consider us authenticated
        cy.visit('http://localhost:5173', {
          onBeforeLoad(win) {
            win.localStorage.setItem('demo_jwt', token);
            win.localStorage.setItem('demo_user', JSON.stringify(demoUser));
          },
        });

        // navigate to Challenges view
        cy.contains('button', 'Challenges').click();

        // click Generate Challenge (AI)
        cy.contains('Generate Challenge (AI)').click();

        // click Generate, expect a generated title/description to appear
        cy.contains('Generate challenge').click();
        cy.get('.card').contains(/AI: Generate Challenge|AI Feedback|AI Feedback/i).should('exist');

        // submit for feedback
        cy.get('textarea').type('This is a cypress UI submission');
        cy.contains('Submit for feedback').click();
        cy.contains('AI Feedback').should('exist');
      });
    });
  });
});
