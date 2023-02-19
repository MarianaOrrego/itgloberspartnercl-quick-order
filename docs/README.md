# QUICK ORDER


<!-- DOCS-IGNORE:start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- DOCS-IGNORE:end -->

Sección de la pagina en la cual el cliente puede realizar una *compra rapida* empleando el SKU del producto, cuando se ha realizado una busqueda y se encuentra stock se re direccionando al cliente al *checkout* para realizar el pago.

![image](https://user-images.githubusercontent.com/83648336/219908726-78d53afa-3fb0-4bdf-8607-3c7e18891ebd.png)

## Configuración

1. Usar el template [vtex-app](https://github.com/vtex-apps/react-app-template)
2. Modificar el `manifest.json`
     ```json 
        {
          "vendor": "itgloberspartnercl",
          "name": "quick-order",
          "version": "0.0.1",
          "title": "Compra rapida",
          "description": "Input que permitirá una compra rapida en mi sitio",
        }
     ``` 
      **vendor:** nombre del cliente o información suministrada por él

      **name:** nombre del componente

      **version:** versión del componente

      **title:** titulo asigando al componente

      **description:** breve descripción del componente


   Agregar en la sección `builders` dentro del `manifest.json` un `store`

    ```json   
        "store" : "0.x"
    ```
   En `dependencies` se van a agregar las siguientes dependencias necesarias para el funcionamiento del **quick order**

    ```json   
        "dependencies": {
          "vtex.checkout-graphql": "0.x",
          "vtex.store-graphql": "2.x",
          "vtex.css-handles": "0.x"
        }
    ```  
3. En el template se tienen dos `package.json` en ambos se debe modificar la `version` y el `name` 
   ```json 
        "version": "0.0.1",
        "name": "quick-order"
   ```  
4. Agregar a la carpeta raíz una carpeta llamada `store`, dentro crear un file llamado `interfaces.json`, en este file se tendrá la siguiente configuración:
    ```json 
        {
          "quick-order": {
              "component": "QuickOrder",
              "render": "client"
          }
        }
    ```
      Se especifica el nombre del componente con el cual será llamado en el `store-theme` de la tienda que se esta realizando, dentro se encuentra el `component` (se debe poner el nombre del componente React a realizar) y por ultimo el `render` donde se especifica que su renderización será solo en la parte del *cliente* 

5. Finalizado los puntos anteriores, se procede a ingresar a la carpeta `react` en la cual se realizan las siguientes configuraciones: 
    
    5.1. Ejecutar el comando `yarn install` para preparar las dependencias
    
    5.2. Crear el functional component `QuickOrder.tsx` con la siguiente configuración 
    
    ```typescript
          import QuickOrder from './components/QuickOrder';

          export default QuickOrder;
    ```   
    5.3. Crear una carpeta llamada `components`, dentro se tiene el functional component `QuickOrder` con la configuración necesaria para el funcionamiento del componente, se tienen las importaciones empleadas y el desarrollo delc componente
    ```typescript
          import React, { useState, useEffect } from 'react';
          
          import { useLazyQuery, useMutation } from 'react-apollo';
          
          import UPDATE_CART from '../graphql/updateCart.graphql';
          
          import GET_PRODUCT from '../graphql/getProductBySku.graphql';
          

          import { useCssHandles } from 'vtex.css-handles';
          import './styles.css';

          const QuickOrder = () => {

              const CSS_HANDLES = [
                  "quick__container",
                  "quick__label",
                  "quick__input",
                  "quick__button"
              ]
              const handles = useCssHandles(CSS_HANDLES)

              const [inputText, setInputText] = useState("");
              const [search, setSearch] = useState("");

              const [addToCart] = useMutation(UPDATE_CART)

              const [getProductData, { data: product }] = useLazyQuery(GET_PRODUCT)

              const handleChange = (event: any) => setInputText(event.target.value)

              useEffect(() => {

                  console.log("el resultado de mi busqueda es", product, search)

                  if (product) {

                      let skuId = parseInt(inputText)

                      addToCart({
                          variables: {
                              salesChannel: "1",
                              items: [
                                  {
                                      id: skuId,
                                      quantity: 1,
                                      seller: "1"
                                  }
                              ]
                          }
                      }).then(() => {
                          window.location.href = "/checkout"
                      })
                  }

              }, [product, search])

              const addProductToCart = () => {
                  getProductData({
                      variables: {
                          sku: inputText
                      }
                  })
              }

              const searchProduct = (event: any) => {
                  event.preventDefault();
                  if (!inputText) {
                      alert("Ingrese un número SKU")
                  } else {
                      console.log("Estamos buscando", inputText)
                      setSearch(inputText)
                      addProductToCart()
                  }
              }
              console.log("input change", inputText)

              return (
                  <div className={handles["quick__container"]}>
                      <p>Compra rápida</p>
                      <form onSubmit={searchProduct}>
                          <div>
                              <label
                                  className={handles["quick__label"]}
                                  htmlFor='sku'
                              >
                                  Ingrese referencia
                              </label>
                              <input
                                  className={handles["quick__input"]}
                                  type='text'
                                  id='sku'
                                  onChange={handleChange}
                              />
                          </div>
                          <input
                              className={handles["quick__button"]}
                              type='submit'
                              value='Añadir a la bolsa'
                          />
                      </form>
                  </div>
              )
          }

          export default QuickOrder
    ```
    5.4. En la carpeta `react` se crea una carpeta `graphql` la cual contendra dos archivos que serviran para traer el producto en base a su SKU y actualizar el *minicart*
    
    5.4.1. *Query* para obtener el producto en base de su SKU 
    
    ```graphql
       query($sku: ID!){
        product(identifier: {field: sku, value: $sku}){
            productId 
            productName
        }
      }
    ```
    
     5.4.2. *Mutation* para actualizar el *minicart* de la tienda
    
    ```graphql
       mutation UPDATE_CART($items: [ItemInput], $salesChannel: String)
       {
            addToCart(items: $items, salesChannel: $salesChannel){
                id
            }
       }
    ```
        
    **NOTA:** para realizar la **query** y **mutation** lo ideal es apoyarse de GraphQL IDE en la sección de **admin** de VTEX IO para la tienda que se esta desarrollando

6. Linkear el componente custom al `store-theme` de la tienda base

    6.1. Iniciar sesión 
    ```console
       vtex login <vendor>
    ```

    6.2. Elegir el `workspace` en el cual se esta trabajando
    ```console
       vtex use <nombre_worksapce>
    ```

    6.3. Linkear el componente
    ```console
       vtex link
    ```

    6.4. Verificar que el componente quede linkeado, para eso se emplea el siguiente comando

     ```console
        vtex ls
     ```

    En consola debe verse las aplicaciones linkeadas al proyecto, verificando de esta forma que el componente quedo listo para emplearse:

    ```console
        Linked Apps in <vendor> at workspace <nombre_store_theme>
        itgloberspartnercl.quick-order                  0.0.1
     ```
      
7. Hacer el llamado del componente desde el `store theme`


## Personalización
      

Para personalizar el componente con CSS, siga las instrucciones que se encuentran en [Using CSS Handles for store customization](https://developers.vtex.com/docs/guides/vtex-io-documentation-using-css-handles-for-store-customization).

Las clases empleadas en el componente son:

| CSS Handles |
| ----------- | 
| `quick__button` | 
| `quick__container` | 
| `quick__input` | 
| `quick__label` | 

<!-- DOCS-IGNORE:start -->

## Colaboradores ✨

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

Mariana Orrego Franco

<!-- DOCS-IGNORE:end -->

