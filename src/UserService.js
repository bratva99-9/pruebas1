import { UALJs } from 'ual-plainjs-renderer';
import { Wax } from '@eosdacio/ual-wax';
import { isEmpty } from 'lodash';
import { Anchor } from 'ual-anchor';

import { storeAppDispatch } from './GlobalState/Store';
import { setPlayerBalance, setPlayerData, setPlayerLogout } from './GlobalState/UserReducer';

export class User {
  appName = 'ual_template';

  // CONFIGURACIÓN MAINNET
  myChain = {
    chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4', // WAX Mainnet
    rpcEndpoints: [{
      protocol: 'https',
      host: 'wax.greymass.com', // ENDPOINT MAINNET recomendado
      port: ''
    }]
  };

  ual;
  authName = undefined;
  serviceLoginName = undefined;
  session = undefined;

  balance = "0.00000000 WAX";
  sexyBalance = "0.00000000 SEXY";

  callbackServerUserData = undefined;

  getName() {
    return this.authName;
  }

  login(callback) {
    const ualButton = document.querySelector(".ual-button-gen");
    if (ualButton) ualButton.click();
    this.callbackServerUserData = callback;
  }

  isLogged() {
    return !isEmpty(this.authName) && !isEmpty(this.session);
  }

  logout() {
    console.log("Logout");
    this.authName = undefined;
    this.session = undefined;
    this.ual.logoutUser();
    storeAppDispatch(setPlayerLogout());

    if (this.callbackServerUserData !== undefined) {
      this.callbackServerUserData();
    }
  }

  async ualCallback(userObject) {
    this.session = userObject[0];
    this.serviceLoginName = this.session.constructor.name;
    this.authName = await this.session.getAccountName();

    storeAppDispatch(setPlayerData({
      name: this.authName,
      isLogged: this.isLogged(),
      balance: this.balance
    }));

    await this.reloadBalances();

    if (this.callbackServerUserData !== undefined) {
      this.callbackServerUserData();
    }
  }

  // --- Recarga ambos balances
  async reloadBalances() {
    await this.getBalance();
    await this.getSexyBalance();
  }

  getBalance() {
    if (!this.session || !this.session.rpc || !this.authName) {
      console.warn("No se pudo obtener el balance porque no hay sesión.");
      return;
    }

    const balance = this.session.rpc.get_account(this.authName);

    balance.then((accountData) => {
      this.balance = accountData.core_liquid_balance || "0.00000000 WAX";
      storeAppDispatch(setPlayerBalance(this.balance));
    }).catch((error) => {
      console.error("Error al obtener el balance de WAX:", error.message);
      this.balance = "0.00000000 WAX";
      storeAppDispatch(setPlayerBalance(this.balance));
    });

    return balance;
  }

  async getSexyBalance() {
    if (!this.session || !this.session.rpc || !this.authName) {
      console.warn("No se pudo obtener el balance de SEXY porque no hay sesión.");
      return;
    }

    try {
      const result = await this.session.rpc.get_currency_balance(
        'nightclub.gm',
        this.authName,
        'SEXY'
      );
      this.sexyBalance = result.length > 0 ? result[0] : "0.00000000 SEXY";
      // Puedes agregar un dispatch aquí si quieres guardar el saldo en Redux también.
      // Ejemplo: storeAppDispatch(setPlayerSexyBalance(this.sexyBalance));
    } catch (err) {
      console.error("Error al obtener el balance de SEXY:", err.message);
      this.sexyBalance = "0.00000000 SEXY";
    }
  }

  /**
   * Transferir uno o varios NFTs a nightclub.gm para staking.
   * @param {string[]} asset_ids
   */
  async stakeNFTs(asset_ids) {
    if (!this.session || !this.authName) throw new Error("No wallet session activa.");
    if (!Array.isArray(asset_ids) || asset_ids.length === 0) throw new Error("No hay NFTs seleccionados.");

    const actions = [{
      account: "atomicassets",
      name: "transfer",
      authorization: [{
        actor: this.authName,
        permission: "active"
      }],
      data: {
        from: this.authName,
        to: "nightclub.gm",
        asset_ids: asset_ids,
        memo: "" // Memo vacío
      }
    }];

    return this.session.signTransaction(
      { actions },
      { blocksBehind: 3, expireSeconds: 60 }
    );
  }

  init() {
    this.ualCallback = this.ualCallback.bind(this);

    const wax = new Wax([this.myChain], { appName: this.appName });
    const anchor = new Anchor([this.myChain], { appName: this.appName });

    const divUal = document.createElement('div');
    divUal.setAttribute('id', 'ual-login');
    document.body.appendChild(divUal);

    const divLoginRoot = document.getElementById('ual-login');
    this.ual = new UALJs(this.ualCallback, [this.myChain], this.appName, [wax, anchor], {
      containerElement: divLoginRoot
    });

    this.ual.init();
  }

  static new() {
    if (!User.instance) {
      User.instance = new User();
    }
    return User.instance;
  }
}

export const UserService = User.new(); // debe ser una instancia, no la clase User
