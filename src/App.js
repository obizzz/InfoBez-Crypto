import React, {useState, useEffect} from "react";
import './App.css';

const CryptoJS = require("crypto-js");
const crypto = require("crypto");

const CRYPTO_FUNCTION = {
    Rijndael: "Rijndael",
    DES: "DES"
}

const CRYPTO_FUNCTION_TYPE = {
    ECB: "ECB",
    CBC: "CBC",
    CTS: "CTS"
}

const PADDING = {
    PCKS7: "PCKS7",
    ZERO: "ZERO"
}

function toHex(s) {
    s = unescape(encodeURIComponent(s))
    let h = ''
    for (let i = 0; i < s.length; i++) {
        h += s.charCodeAt(i).toString(16)
    }
    return h
}

function fromHex(h) {
    let s = ''
    for (let i = 0; i < h.length; i += 2) {
        s += String.fromCharCode(parseInt(h.substr(i, 2), 16))
    }
    return decodeURIComponent(escape(s))
}

function App() {
    const [selectedFunc, setSelectedFunc] = useState(CRYPTO_FUNCTION.DES)
    const [selectedFuncTypes, setSelectedFuncTypes] = useState(CRYPTO_FUNCTION_TYPE.ECB)
    const [selectedPadding, setSelectedPadding] = useState(PADDING.ZERO)
    const [keySize, setkeySize] = useState(128);

    const [key, setKey] = useState("");
    const [iv, setIv] = useState("");

    const [text, setText] = useState("");

    const [encodedText, setEncodedText] = useState("");
    const [decodedText, setDecodedText] = useState("");

    const generateKey = () => {
        setKey(crypto.randomBytes(keySize / 16).toString('hex'));
    }
    const generateIV = () => {
        setIv(Math.random().toString(36).substring(2));
    }
//если меняется keysize генерится ключ
    useEffect(generateKey, [keySize]);

    const encrypt = () => {
        const key1 = CryptoJS.enc.Hex.parse(key.slice(-8));    // переводим в шестнадцатеричную систему счисления
        const padding = selectedPadding === PADDING.PCKS7 ? CryptoJS.pad.Pkcs7 : CryptoJS.pad.ZeroPadding;
        if (selectedFunc === CRYPTO_FUNCTION.DES) {
            setEncodedText(
                toHex(CryptoJS.DES.encrypt(text, key1, {
                    iv: CryptoJS.enc.Hex.parse(iv),
                    mode: selectedFuncTypes === CRYPTO_FUNCTION_TYPE.ECB ? CryptoJS.mode.ECB : selectedFuncTypes === CRYPTO_FUNCTION_TYPE.CBC ? CryptoJS.mode.CBC : CryptoJS.mode.CFB,
                    padding
                }))
            );
        } else {
            setEncodedText(
                toHex(CryptoJS.AES.encrypt(text, key1, {
                    keySize,
                    iv: CryptoJS.enc.Hex.parse(iv),
                    mode: selectedFuncTypes === CRYPTO_FUNCTION_TYPE.ECB ? CryptoJS.mode.ECB : selectedFuncTypes === CRYPTO_FUNCTION_TYPE.CBC ? CryptoJS.mode.CBC : CryptoJS.mode.CFB,
                    padding
                }))
            );
        }
    }

    const decrypt = () => {
        const key1 = CryptoJS.enc.Hex.parse(key.slice(-8));
        const padding = selectedPadding === PADDING.PCKS7 ? CryptoJS.pad.Pkcs7 : CryptoJS.pad.ZeroPadding;
        if (selectedFunc === CRYPTO_FUNCTION.DES) {
            setDecodedText(CryptoJS.DES.decrypt(fromHex(encodedText), key1, {
                iv: CryptoJS.enc.Hex.parse(iv),
                mode: selectedFuncTypes === CRYPTO_FUNCTION_TYPE.ECB ? CryptoJS.mode.ECB : selectedFuncTypes === CRYPTO_FUNCTION_TYPE.CBC ? CryptoJS.mode.CBC : CryptoJS.mode.CFB,
                padding
            }).toString(CryptoJS.enc.Utf8));
        } else {
            setDecodedText(CryptoJS.AES.decrypt(fromHex(encodedText), key1, {
                keySize,
                iv: CryptoJS.enc.Hex.parse(iv),
                mode: selectedFuncTypes === CRYPTO_FUNCTION_TYPE.ECB ? CryptoJS.mode.ECB : selectedFuncTypes === CRYPTO_FUNCTION_TYPE.CBC ? CryptoJS.mode.CBC : CryptoJS.mode.CFB,
                padding
            }).toString(CryptoJS.enc.Utf8));
        }
    }

    const clearInput = () => {
        setKey("");
        setIv("");
        setText("");
        setEncodedText("");
        setDecodedText("");
    }

    return (
        <div className="App">
            <div class='text-sm-left'>
                <div style={{display: 'inline-flex'}}>
                    <div class='form-element'>
                        <input type="radio" id="DES" value="DES" checked={selectedFunc === CRYPTO_FUNCTION.DES}
                               onClick={() => {
                                   clearInput();
                                   setSelectedFunc(CRYPTO_FUNCTION.DES)
                               }}/>
                        <label>DES</label>
                    </div>
                    <div class='form-element'>
                        <input type="radio" id="Rijndael" value="Rijndael"
                               checked={selectedFunc === CRYPTO_FUNCTION.Rijndael} onClick={() => {
                            clearInput();
                            setSelectedFunc(CRYPTO_FUNCTION.Rijndael)
                        }}/>
                        <label>Rijndael</label>
                    </div>
                </div>
                <div style={{display: 'inline-flex'}}>
                    <div class='form-element'>
                        <input type="radio" id="ECB" value="ECB"
                               checked={selectedFuncTypes === CRYPTO_FUNCTION_TYPE.ECB} onClick={() => {
                            clearInput();
                            setSelectedFuncTypes(CRYPTO_FUNCTION_TYPE.ECB)
                        }}/>
                        <label>ECB</label>
                    </div>
                    <div class='form-element'>
                        <input type="radio" id="CTS" value="CTS"
                               checked={selectedFuncTypes === CRYPTO_FUNCTION_TYPE.CTS} onClick={() => {
                            clearInput();
                            setSelectedFuncTypes(CRYPTO_FUNCTION_TYPE.CTS)
                        }}/>
                        <label>CTS</label>
                    </div>
                    <div className='form-element'>
                        <input type="radio" id="CBC" value="CBC"
                               checked={selectedFuncTypes === CRYPTO_FUNCTION_TYPE.CBC}
                               onClick={() => {
                                   clearInput();
                                   setSelectedFuncTypes(CRYPTO_FUNCTION_TYPE.CBC)
                               }}/>
                        <label>CBC</label>
                    </div>
                </div>
            </div>
            {selectedFunc === CRYPTO_FUNCTION.Rijndael && (
                <div class='text-sm-left form-element'>
                    <select name="pets" id="pet-select" onChange={(e) => setkeySize(Number(e.target.value))}>
                        <option value="128">128</option>
                        <option value="160">160</option>
                        <option value="192">192</option>
                        <option value="224">224</option>
                        <option value="256">256</option>
                    </select>
                </div>
            )}
            <div style={{display: 'block'}}>
                <div class='text-sm-left form-element'>
                    <label>Key: &#160;</label>
                    <input value={key} onChange={(e) => setKey(e.target.value)}/>
                    <button onClick={generateKey}>Generate</button>
                    <br/>
                </div>
                <div class='text-sm-left form-element'>
                    <label>IV: &#160;</label>
                    <input value={iv} onChange={(e) => setIv(e.target.value)}/>
                    <button onClick={generateIV}>Generate</button>
                    <br/>
                </div>
                <div class='text-sm-left'>
                    <label class='form-element'>Padding:</label>
                    <div style={{display: 'inline-flex'}}>
                        <div class='form-element'>
                            <input type="radio" id="Zero" value="Zero" checked={selectedPadding === PADDING.ZERO}
                                   onClick={() => {
                                       clearInput();
                                       setSelectedPadding(PADDING.ZERO)
                                   }}/>
                            <label>Zero</label>
                        </div>
                        <div class='form-element'>
                            <input type="radio" id="pcks7" value="pcks7" checked={selectedPadding === PADDING.PCKS7}
                                   onClick={() => {
                                       clearInput();
                                       setSelectedPadding(PADDING.PCKS7)
                                   }}/>
                            <label>pcks7</label>
                        </div>
                    </div>
                </div>
                <div class='text-sm-left form-element'>
                    <label>Input: &#160;</label>
                    <input value={text} onChange={(e) => setText(e.target.value)}/>
                    <button onClick={encrypt}>Encrypt</button>
                    <br/>
                </div>
                <div class='text-sm-left form-element'>
                    <label>Encrypted text: &#160;</label>
                    <input value={encodedText} className="decrypt"/>
                    <button onClick={decrypt}>Decrypt</button>
                    <br/>
                </div>
                <div class='text-sm-left form-element'>
                    <label>Decrypted text: &#160;</label>
                    <input value={decodedText}/>
                </div>
            </div>
        </div>
    );
}

export default App;
