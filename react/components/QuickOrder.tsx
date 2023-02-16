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
