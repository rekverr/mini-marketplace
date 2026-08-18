
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/": {
        "get": {
          "operationId": "AppController_getHealthCheck",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "App"
          ]
        }
      },
      "/health": {
        "get": {
          "operationId": "HealthController_check",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Health"
          ]
        }
      },
      "/categories": {
        "post": {
          "operationId": "CategoryController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateCategoryDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Category"
          ]
        },
        "get": {
          "operationId": "CategoryController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Category"
          ]
        }
      },
      "/categories/{id}": {
        "get": {
          "operationId": "CategoryController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Category"
          ]
        },
        "patch": {
          "operationId": "CategoryController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCategoryDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Category"
          ]
        },
        "delete": {
          "operationId": "CategoryController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Category"
          ]
        }
      },
      "/products": {
        "post": {
          "operationId": "ProductController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateProductDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Product"
          ]
        },
        "get": {
          "operationId": "ProductController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Product"
          ]
        }
      },
      "/products/{id}": {
        "get": {
          "operationId": "ProductController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Product"
          ]
        },
        "patch": {
          "operationId": "ProductController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateProductDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Product"
          ]
        },
        "delete": {
          "operationId": "ProductController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Product"
          ]
        }
      },
      "/users": {
        "post": {
          "operationId": "UserController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "User"
          ]
        },
        "get": {
          "operationId": "UserController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "User"
          ]
        }
      },
      "/users/{id}": {
        "get": {
          "operationId": "UserController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "User"
          ]
        },
        "patch": {
          "operationId": "UserController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateUserDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "User"
          ]
        },
        "delete": {
          "operationId": "UserController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "User"
          ]
        }
      },
      "/auth/register": {
        "post": {
          "operationId": "AuthController_register",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/login": {
        "post": {
          "operationId": "AuthController_login",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/refresh": {
        "post": {
          "operationId": "AuthController_refresh",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RefreshDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/logout": {
        "post": {
          "operationId": "AuthController_logout",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RefreshDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/cart": {
        "get": {
          "operationId": "CartController_getCart",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Cart"
          ]
        },
        "delete": {
          "operationId": "CartController_clearCart",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Cart"
          ]
        }
      },
      "/cart/items": {
        "post": {
          "operationId": "CartController_addItem",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AddCartItemDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Cart"
          ]
        }
      },
      "/cart/items/{productId}": {
        "patch": {
          "operationId": "CartController_updateItem",
          "parameters": [
            {
              "name": "productId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCartItemDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Cart"
          ]
        },
        "delete": {
          "operationId": "CartController_removeItem",
          "parameters": [
            {
              "name": "productId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Cart"
          ]
        }
      },
      "/orders/checkout": {
        "post": {
          "operationId": "OrderController_checkout",
          "parameters": [],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Order"
          ]
        }
      },
      "/orders/me": {
        "get": {
          "operationId": "OrderController_getUserOrders",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Order"
          ]
        }
      },
      "/orders/admin": {
        "get": {
          "operationId": "OrderController_getAllOrders",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Order"
          ]
        }
      },
      "/orders/admin/{id}/status": {
        "patch": {
          "operationId": "OrderController_updateOrderStatus",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateOrderStatusDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Order"
          ]
        }
      },
      "/admin/analytics/summary": {
        "get": {
          "operationId": "AnalyticsController_getSummary",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Analytics"
          ]
        }
      },
      "/admin/analytics/daily": {
        "get": {
          "operationId": "AnalyticsController_getDaily",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Analytics"
          ]
        }
      },
      "/admin/analytics/top-products": {
        "get": {
          "operationId": "AnalyticsController_getTopProducts",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Analytics"
          ]
        }
      },
      "/admin/analytics/export.csv": {
        "get": {
          "operationId": "AnalyticsController_exportCsv",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Analytics"
          ]
        }
      }
    },
    "info": {
      "title": "Mini Marketplace API",
      "description": "Документація для бекенду маркетплейсу",
      "version": "1.0",
      "contact": {}
    },
    "tags": [],
    "servers": [],
    "components": {
      "securitySchemes": {
        "bearer": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http"
        }
      },
      "schemas": {
        "CreateCategoryDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateCategoryDto": {
          "type": "object",
          "properties": {}
        },
        "CreateProductDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateProductDto": {
          "type": "object",
          "properties": {}
        },
        "CreateUserDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateUserDto": {
          "type": "object",
          "properties": {}
        },
        "LoginDto": {
          "type": "object",
          "properties": {}
        },
        "RefreshDto": {
          "type": "object",
          "properties": {}
        },
        "AddCartItemDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateCartItemDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateOrderStatusDto": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
