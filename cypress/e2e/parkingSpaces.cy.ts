/// <reference types="cypress" />

describe('Gestión de Espacios de Estacionamiento', () => {
  const mockGarageCuit = '11'; // CUIT Simulado

  beforeEach(() => {
    // ---------------------------------------------------------------
    // 1. INTERCEPTS (Preparamos las respuestas falsas del Backend)
    // ---------------------------------------------------------------

    // Mock de Tipos de Vehículo (necesario para los selectores)
    cy.intercept('GET', '**/api/type-vehicles', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Auto' },
        { id: 2, name: 'Moto' },
        { id: 3, name: 'Camioneta' }
      ]
    }).as('getTypeVehicles');

    // Mock del Listado de Espacios (para cuando entremos a 'Listado')
    // Usamos un * (wildcard) al final para que coincida con cualquier CUIT
    cy.intercept('GET', '**/api/parkingSpaces/*', {
      statusCode: 200,
      body: [
        { number: '101', TypeVehicle: { id: 1, name: 'Auto' } },
        { number: '102', TypeVehicle: { id: 2, name: 'Moto' } }
      ]
    }).as('getParkingSpaces');

    // Mock de reservas activas (para bloqueo de espacios)
    cy.intercept('GET', '**/api/reservations/**', {
      statusCode: 200,
      body: []
    }).as('getReservations');

    // ---------------------------------------------------------------
    // 2. LOGIN (Entramos a la aplicación)
    // ---------------------------------------------------------------
    cy.visit('/login');

    // Ajusta estos selectores a tu Login real
    cy.get('input[name="uname"]').type(mockGarageCuit);
    cy.get('input[name="psw"]').type('111111');
    cy.get('button[type="submit"]').click();

    // Verificamos que salimos del login
    cy.url({ timeout: 10000 }).should('not.include', '/login');

    // ---------------------------------------------------------------
    // 3. NAVEGACIÓN POR SIDEBAR (El paso clave que faltaba)
    // ---------------------------------------------------------------

    // Buscamos el enlace en el menú lateral que lleva a Espacios.
    cy.contains('a', 'Espacios', { matchCase: false }).click({ force: true });

    // Verificamos que cargó el título principal del componente Parking
    cy.contains('h2', 'Gestionar mis Espacios', { timeout: 10000 }).should('be.visible');
  });

  it('Debe mostrar el dashboard inicial con las 2 opciones', () => {
    // Verificamos que las tarjetas del menú (@if currentSection == 'initial') están visibles
    cy.contains('.card-title', 'Ver espacios').should('be.visible');
    cy.contains('.card-title', 'Crear').should('be.visible');
  });

  it('Debe entrar al Listado, ver la grilla y poder volver', () => {
    // 1. Clic en la tarjeta de Ver espacios
    cy.contains('.card', 'Ver espacios').click();

    // 2. Esperamos la llamada al API (ahora sí se dispara)
    cy.wait('@getParkingSpaces');

    // 3. Verificamos que cambió la vista (@if currentSection == 'getParkingSpace')
    cy.contains('h3', 'Espacios creados').should('be.visible');

    // 4. Verificamos que la grilla tiene los espacios mockeados
    cy.get('.space-view-btn').should('have.length', 2);
    cy.get('.space-view-btn').contains('101').should('be.visible');
    cy.get('.space-view-btn').contains('102').should('be.visible');

    // 5. Clic en un espacio para ver el panel de detalle
    cy.get('.space-view-btn').contains('101').click();
    cy.get('.detail-panel').should('be.visible');
    cy.contains('Espacio #101').should('be.visible');
    cy.contains('Auto').should('be.visible');

    // 6. Verificamos que los botones de acción están presentes
    cy.get('.detail-panel').contains('button', 'Editar').should('be.visible');
    cy.get('.detail-panel').contains('button', 'Eliminar').should('be.visible');

    // 7. Clic en el mismo espacio para deseleccionar
    cy.get('.space-view-btn').contains('101').click();
    cy.get('.detail-panel').should('not.exist');

    // 8. Probamos el botón Volver
    cy.contains('button', 'Volver').click();

    // 9. Confirmamos que regresamos al menú inicial
    cy.contains('h2', 'Gestionar mis Espacios').should('be.visible');
  });

  it('Debe permitir crear espacios mediante la grilla de selección', () => {
    // Interceptamos la creación (POST)
    cy.intercept('POST', '**/api/parkingSpaces', {
      statusCode: 201,
      body: { message: 'Created' }
    }).as('createSpace');

    // 1. Clic en "Crear"
    cy.contains('.card', 'Crear').click();

    // 2. Verificamos que estamos en la vista de creación múltiple
    cy.contains('h3', 'Crear espacios').should('be.visible');

    // 3. Seleccionamos un tipo de vehículo
    cy.get('select#multipleTypeVehicle').select('Auto');

    // 4. Seleccionamos espacios en la grilla (los que no estén ya existentes)
    // Los espacios 101 y 102 ya existen (mockeados), seleccionamos otros
    cy.get('.space-grid-btn').contains('1').click();
    cy.get('.space-grid-btn').contains('2').click();

    // 5. Verificamos que se muestra el resumen de selección
    cy.contains('.alert-info', '2').should('be.visible');

    // 6. Enviamos
    cy.contains('button', 'Crear espacios').click();

    // 7. Esperamos las llamadas al backend (una por cada espacio)
    cy.wait('@createSpace');
    cy.wait('@createSpace');

    // 8. Verificamos mensaje de éxito y redirección al menú inicial
    cy.contains('Espacio creado exitosamente', { timeout: 10000 }).should('be.visible');
    cy.contains('h2', 'Gestionar mis Espacios').should('be.visible');
  });
});