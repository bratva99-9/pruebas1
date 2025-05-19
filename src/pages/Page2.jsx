import React, { useState } from 'react';
import { UserService } from '../UserService';

const Page2 = () => {
    const [amount, setAmount] = useState('1.00000000');
    const [recipient, setRecipient] = useState('3dkrenderwax');

    const onHandleSendWax = () => {
        if (!UserService.isLogged()) {
            alert('Debes iniciar sesión para transferir WAX.');
            return;
        }
        if (!amount || isNaN(parseFloat(amount))) {
            alert('Ingresa una cantidad válida.');
            return;
        }
        if (!recipient || recipient.length < 5 || recipient.length > 12) {
            alert('Ingresa una cuenta destinataria válida.');
            return;
        }

        UserService.session.signTransaction(
            {
                actions: [{
                    account: 'eosio.token',
                    name: 'transfer',
                    authorization: [{
                        actor: UserService.authName,
                        permission: 'active'
                    }],
                    data: {
                        from: UserService.authName,
                        to: recipient,
                        quantity: `${parseFloat(amount).toFixed(8)} WAX`,
                        memo: 'Transferencia personalizada'
                    }
                }]
            },
            {
                blocksBehind: 3,
                expireSeconds: 30
            }
        ).then((response) => {
            if(response && response.processed && response.processed.receipt && response.processed.receipt.status === 'executed') {
                UserService.getBalance();
                alert('Transacción enviada con éxito');
            } else {
                alert('Hubo un problema con la transacción.');
            }
        }).catch((error) => {
            alert('Error al enviar la transacción: ' + (error && error.message ? error.message : error));
        });
    }

    return (
        <div className="container text-white text-center mt-5">
            <h1>Transferencia Personalizada</h1>
            <input 
                className="form-control mt-3" 
                type="text" 
                placeholder="Cantidad de WAX" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <input 
                className="form-control mt-3" 
                type="text" 
                placeholder="Cuenta destinataria" 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
            />
            <button className="btn btn-success btn-lg mt-3" onClick={onHandleSendWax}>
                Enviar WAX
            </button>
        </div>
    );
};

export default Page2;
