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
    // Ajusta el texto 'Espacios' o 'Estacionamiento' según cómo se llame en tu menú.
    // Si tienes un sidebar colapsable, quizás necesites hacer clic en un botón de menú primero.
    cy.contains('a', 'Espacios', { matchCase: false }).click({ force: true });

    // Verificamos que cargó el título principal del componente Parking
    cy.contains('h2', 'Gestión de Espacios', { timeout: 10000 }).should('be.visible');
  });

  it('Debe mostrar el dashboard inicial con las 3 opciones', () => {
    // Verificamos que las tarjetas del menú (@if currentSection == 'initial') están visibles
    cy.contains('.card-title', 'Listado de Espacios').should('be.visible');
    cy.contains('.card-title', 'Nuevo Espacio').should('be.visible');
    cy.contains('.card-title', 'Crear Múltiples').should('be.visible');
  });

  it('Debe entrar al Listado, ver datos y poder volver', () => {
    // 1. Clic en la tarjeta de Listado
    cy.contains('.card', 'Listado de Espacios').click();

    // 2. Esperamos la llamada al API (ahora sí se dispara)
    cy.wait('@getParkingSpaces');

    // 3. Verificamos que cambió la vista (@if currentSection == 'getParkingSpace')
    cy.contains('h3', 'Listado de Lugares').should('be.visible');

    // 4. Verificamos que la tabla tiene datos
    cy.get('table').should('exist');
    cy.contains('td', '101').should('be.visible'); // El dato mockeado
    cy.contains('td', 'Auto').should('be.visible');

    // 5. Probamos el botón Volver
    cy.contains('button', 'Volver').click();
    
    // 6. Confirmamos que regresamos al menú inicial
    cy.contains('h2', 'Gestión de Espacios').should('be.visible');
  });

  it('Debe permitir crear un nuevo espacio individual', () => {
    // Interceptamos la creación (POST)
    cy.intercept('POST', '**/api/parkingSpaces', {
      statusCode: 201,
      body: { message: 'Created' }
    }).as('createSpace');

    // 1. Clic en "Nuevo Espacio"
    cy.contains('.card', 'Nuevo Espacio').click();

    // 2. Esperamos que carguen los tipos de vehículo (si se cargan al iniciar el componente, quizás ya estén listos)
    // Si tu ngOnInit llama a loadTypeVehicles, la llamada @getTypeVehicles ya ocurrió al principio.
    
    // 3. Verificamos que estamos en el formulario
    cy.contains('h3', 'Registrar Nuevo Lugar').should('be.visible');

    // 4. Llenamos el formulario
    cy.get('input#number').type('500');
    cy.get('select#TypeVehicle').select('Auto'); // Selecciona por el texto visible

    // 5. Enviamos
    cy.contains('button', 'Dar de Alta').click();

    // 6. Esperamos confirmación del backend
    cy.wait('@createSpace');

    // 7. Verificamos mensaje de éxito y redirección
    cy.contains('.alert-success', 'Parking creado exitosamente').should('be.visible');
    cy.contains('h2', 'Gestión de Espacios').should('be.visible');
  });
});