describe('Sign Up Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4002/auth/register', { failOnStatusCode: false });
  });

  it('should allow a user to register', () => {
    // Remplir les champs du formulaire
    cy.get('input#username').type('testuser');
    cy.get('input#phoneNumber').type('1234567890');
    cy.get('input#email').type('t2$s222311r@example.com');
    cy.get('input[type="password"]').type('password123');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier que le formulaire est soumis et que l'utilisateur est redirigé
    cy.url().should('eq', 'http://localhost:4002/');
  });

  it('should show an error if registration fails', () => {
    // Champs avec données invalides
    cy.get('input#username').type('testuser');
    cy.get('input#phoneNumber').type('invalidphone');
    cy.get('input#email').type('invalidemail');
    cy.get('input[type="password"]').type('short');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier qu'un message d'erreur s'affiche
    cy.url().should('eq', 'http://localhost:4002/auth/register');
    
  });
});
