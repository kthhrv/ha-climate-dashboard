/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const se = globalThis, fe = se.ShadowRoot && (se.ShadyCSS === void 0 || se.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, _e = Symbol(), Ee = /* @__PURE__ */ new WeakMap();
let Ue = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== _e) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (fe && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = Ee.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && Ee.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const qe = (a) => new Ue(typeof a == "string" ? a : a + "", void 0, _e), T = (a, ...e) => {
  const t = a.length === 1 ? a[0] : e.reduce((s, i, o) => s + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + a[o + 1], a[0]);
  return new Ue(t, a, _e);
}, We = (a, e) => {
  if (fe) a.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const s = document.createElement("style"), i = se.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = t.cssText, a.appendChild(s);
  }
}, Ce = fe ? (a) => a : (a) => a instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const s of e.cssRules) t += s.cssText;
  return qe(t);
})(a) : a;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Fe, defineProperty: Ge, getOwnPropertyDescriptor: Je, getOwnPropertyNames: Ke, getOwnPropertySymbols: Ve, getPrototypeOf: Xe } = Object, C = globalThis, Ie = C.trustedTypes, Ye = Ie ? Ie.emptyScript : "", he = C.reactiveElementPolyfillSupport, J = (a, e) => a, oe = { toAttribute(a, e) {
  switch (e) {
    case Boolean:
      a = a ? Ye : null;
      break;
    case Object:
    case Array:
      a = a == null ? a : JSON.stringify(a);
  }
  return a;
}, fromAttribute(a, e) {
  let t = a;
  switch (e) {
    case Boolean:
      t = a !== null;
      break;
    case Number:
      t = a === null ? null : Number(a);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(a);
      } catch {
        t = null;
      }
  }
  return t;
} }, ge = (a, e) => !Fe(a, e), ze = { attribute: !0, type: String, converter: oe, reflect: !1, useDefault: !1, hasChanged: ge };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), C.litPropertyMetadata ?? (C.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let U = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = ze) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(e, s, t);
      i !== void 0 && Ge(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: i, set: o } = Je(this.prototype, e) ?? { get() {
      return this[t];
    }, set(r) {
      this[t] = r;
    } };
    return { get: i, set(r) {
      const n = i == null ? void 0 : i.call(this);
      o == null || o.call(this, r), this.requestUpdate(e, n, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ze;
  }
  static _$Ei() {
    if (this.hasOwnProperty(J("elementProperties"))) return;
    const e = Xe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(J("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(J("properties"))) {
      const t = this.properties, s = [...Ke(t), ...Ve(t)];
      for (const i of s) this.createProperty(i, t[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [s, i] of t) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, s] of this.elementProperties) {
      const i = this._$Eu(t, s);
      i !== void 0 && this._$Eh.set(i, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const i of s) t.unshift(Ce(i));
    } else e !== void 0 && t.push(Ce(e));
    return t;
  }
  static _$Eu(e, t) {
    const s = t.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const s of t.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return We(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var s;
      return (s = t.hostConnected) == null ? void 0 : s.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var s;
      return (s = t.hostDisconnected) == null ? void 0 : s.call(t);
    });
  }
  attributeChangedCallback(e, t, s) {
    this._$AK(e, s);
  }
  _$ET(e, t) {
    var o;
    const s = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, s);
    if (i !== void 0 && s.reflect === !0) {
      const r = (((o = s.converter) == null ? void 0 : o.toAttribute) !== void 0 ? s.converter : oe).toAttribute(t, s.type);
      this._$Em = e, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var o, r;
    const s = this.constructor, i = s._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const n = s.getPropertyOptions(i), d = typeof n.converter == "function" ? { fromAttribute: n.converter } : ((o = n.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? n.converter : oe;
      this._$Em = i;
      const c = d.fromAttribute(t, n.type);
      this[i] = c ?? ((r = this._$Ej) == null ? void 0 : r.get(i)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, s) {
    var i;
    if (e !== void 0) {
      const o = this.constructor, r = this[e];
      if (s ?? (s = o.getPropertyOptions(e)), !((s.hasChanged ?? ge)(r, t) || s.useDefault && s.reflect && r === ((i = this._$Ej) == null ? void 0 : i.get(e)) && !this.hasAttribute(o._$Eu(e, s)))) return;
      this.C(e, t, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: s, reflect: i, wrapped: o }, r) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, r ?? t ?? this[e]), o !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (t = void 0), this._$AL.set(e, t)), i === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [o, r] of i) {
        const { wrapped: n } = r, d = this[o];
        n !== !0 || this._$AL.has(o) || d === void 0 || this.C(o, void 0, r, d);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (s = this._$EO) == null || s.forEach((i) => {
        var o;
        return (o = i.hostUpdate) == null ? void 0 : o.call(i);
      }), this.update(t)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((s) => {
      var i;
      return (i = s.hostUpdated) == null ? void 0 : i.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
U.elementStyles = [], U.shadowRootOptions = { mode: "open" }, U[J("elementProperties")] = /* @__PURE__ */ new Map(), U[J("finalized")] = /* @__PURE__ */ new Map(), he == null || he({ ReactiveElement: U }), (C.reactiveElementVersions ?? (C.reactiveElementVersions = [])).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis, re = K.trustedTypes, Ne = re ? re.createPolicy("lit-html", { createHTML: (a) => a }) : void 0, He = "$lit$", E = `lit$${Math.random().toFixed(9).slice(2)}$`, je = "?" + E, Qe = `<${je}>`, O = document, V = () => O.createComment(""), X = (a) => a === null || typeof a != "object" && typeof a != "function", ve = Array.isArray, et = (a) => ve(a) || typeof (a == null ? void 0 : a[Symbol.iterator]) == "function", pe = `[ 	
\f\r]`, G = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, De = /-->/g, Pe = />/g, N = RegExp(`>|${pe}(?:([^\\s"'>=/]+)(${pe}*=${pe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Oe = /'/g, Te = /"/g, Le = /^(?:script|style|textarea|title)$/i, tt = (a) => (e, ...t) => ({ _$litType$: a, strings: e, values: t }), l = tt(1), H = Symbol.for("lit-noChange"), g = Symbol.for("lit-nothing"), Me = /* @__PURE__ */ new WeakMap(), D = O.createTreeWalker(O, 129);
function Ze(a, e) {
  if (!ve(a) || !a.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ne !== void 0 ? Ne.createHTML(e) : e;
}
const it = (a, e) => {
  const t = a.length - 1, s = [];
  let i, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = G;
  for (let n = 0; n < t; n++) {
    const d = a[n];
    let c, h, p = -1, m = 0;
    for (; m < d.length && (r.lastIndex = m, h = r.exec(d), h !== null); ) m = r.lastIndex, r === G ? h[1] === "!--" ? r = De : h[1] !== void 0 ? r = Pe : h[2] !== void 0 ? (Le.test(h[2]) && (i = RegExp("</" + h[2], "g")), r = N) : h[3] !== void 0 && (r = N) : r === N ? h[0] === ">" ? (r = i ?? G, p = -1) : h[1] === void 0 ? p = -2 : (p = r.lastIndex - h[2].length, c = h[1], r = h[3] === void 0 ? N : h[3] === '"' ? Te : Oe) : r === Te || r === Oe ? r = N : r === De || r === Pe ? r = G : (r = N, i = void 0);
    const f = r === N && a[n + 1].startsWith("/>") ? " " : "";
    o += r === G ? d + Qe : p >= 0 ? (s.push(c), d.slice(0, p) + He + d.slice(p) + E + f) : d + E + (p === -2 ? n : f);
  }
  return [Ze(a, o + (a[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class Y {
  constructor({ strings: e, _$litType$: t }, s) {
    let i;
    this.parts = [];
    let o = 0, r = 0;
    const n = e.length - 1, d = this.parts, [c, h] = it(e, t);
    if (this.el = Y.createElement(c, s), D.currentNode = this.el.content, t === 2 || t === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = D.nextNode()) !== null && d.length < n; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(He)) {
          const m = h[r++], f = i.getAttribute(p).split(E), v = /([.?@])?(.*)/.exec(m);
          d.push({ type: 1, index: o, name: v[2], strings: f, ctor: v[1] === "." ? ot : v[1] === "?" ? rt : v[1] === "@" ? at : ne }), i.removeAttribute(p);
        } else p.startsWith(E) && (d.push({ type: 6, index: o }), i.removeAttribute(p));
        if (Le.test(i.tagName)) {
          const p = i.textContent.split(E), m = p.length - 1;
          if (m > 0) {
            i.textContent = re ? re.emptyScript : "";
            for (let f = 0; f < m; f++) i.append(p[f], V()), D.nextNode(), d.push({ type: 2, index: ++o });
            i.append(p[m], V());
          }
        }
      } else if (i.nodeType === 8) if (i.data === je) d.push({ type: 2, index: o });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(E, p + 1)) !== -1; ) d.push({ type: 7, index: o }), p += E.length - 1;
      }
      o++;
    }
  }
  static createElement(e, t) {
    const s = O.createElement("template");
    return s.innerHTML = e, s;
  }
}
function j(a, e, t = a, s) {
  var r, n;
  if (e === H) return e;
  let i = s !== void 0 ? (r = t._$Co) == null ? void 0 : r[s] : t._$Cl;
  const o = X(e) ? void 0 : e._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== o && ((n = i == null ? void 0 : i._$AO) == null || n.call(i, !1), o === void 0 ? i = void 0 : (i = new o(a), i._$AT(a, t, s)), s !== void 0 ? (t._$Co ?? (t._$Co = []))[s] = i : t._$Cl = i), i !== void 0 && (e = j(a, i._$AS(a, e.values), i, s)), e;
}
class st {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: s } = this._$AD, i = ((e == null ? void 0 : e.creationScope) ?? O).importNode(t, !0);
    D.currentNode = i;
    let o = D.nextNode(), r = 0, n = 0, d = s[0];
    for (; d !== void 0; ) {
      if (r === d.index) {
        let c;
        d.type === 2 ? c = new Q(o, o.nextSibling, this, e) : d.type === 1 ? c = new d.ctor(o, d.name, d.strings, this, e) : d.type === 6 && (c = new nt(o, this, e)), this._$AV.push(c), d = s[++n];
      }
      r !== (d == null ? void 0 : d.index) && (o = D.nextNode(), r++);
    }
    return D.currentNode = O, i;
  }
  p(e) {
    let t = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, t), t += s.strings.length - 2) : s._$AI(e[t])), t++;
  }
}
class Q {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, s, i) {
    this.type = 2, this._$AH = g, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = s, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = j(this, e, t), X(e) ? e === g || e == null || e === "" ? (this._$AH !== g && this._$AR(), this._$AH = g) : e !== this._$AH && e !== H && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : et(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== g && X(this._$AH) ? this._$AA.nextSibling.data = e : this.T(O.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var o;
    const { values: t, _$litType$: s } = e, i = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = Y.createElement(Ze(s.h, s.h[0]), this.options)), s);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === i) this._$AH.p(t);
    else {
      const r = new st(i, this), n = r.u(this.options);
      r.p(t), this.T(n), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = Me.get(e.strings);
    return t === void 0 && Me.set(e.strings, t = new Y(e)), t;
  }
  k(e) {
    ve(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let s, i = 0;
    for (const o of e) i === t.length ? t.push(s = new Q(this.O(V()), this.O(V()), this, this.options)) : s = t[i], s._$AI(o), i++;
    i < t.length && (this._$AR(s && s._$AB.nextSibling, i), t.length = i);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, t); e !== this._$AB; ) {
      const i = e.nextSibling;
      e.remove(), e = i;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class ne {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, s, i, o) {
    this.type = 1, this._$AH = g, this._$AN = void 0, this.element = e, this.name = t, this._$AM = i, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = g;
  }
  _$AI(e, t = this, s, i) {
    const o = this.strings;
    let r = !1;
    if (o === void 0) e = j(this, e, t, 0), r = !X(e) || e !== this._$AH && e !== H, r && (this._$AH = e);
    else {
      const n = e;
      let d, c;
      for (e = o[0], d = 0; d < o.length - 1; d++) c = j(this, n[s + d], t, d), c === H && (c = this._$AH[d]), r || (r = !X(c) || c !== this._$AH[d]), c === g ? e = g : e !== g && (e += (c ?? "") + o[d + 1]), this._$AH[d] = c;
    }
    r && !i && this.j(e);
  }
  j(e) {
    e === g ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class ot extends ne {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === g ? void 0 : e;
  }
}
class rt extends ne {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== g);
  }
}
class at extends ne {
  constructor(e, t, s, i, o) {
    super(e, t, s, i, o), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = j(this, e, t, 0) ?? g) === H) return;
    const s = this._$AH, i = e === g && s !== g || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, o = e !== g && (s === g || i);
    i && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class nt {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    j(this, e);
  }
}
const ue = K.litHtmlPolyfillSupport;
ue == null || ue(Y, Q), (K.litHtmlVersions ?? (K.litHtmlVersions = [])).push("3.3.1");
const lt = (a, e, t) => {
  const s = (t == null ? void 0 : t.renderBefore) ?? e;
  let i = s._$litPart$;
  if (i === void 0) {
    const o = (t == null ? void 0 : t.renderBefore) ?? null;
    s._$litPart$ = i = new Q(e.insertBefore(V(), o), o, void 0, t ?? {});
  }
  return i._$AI(a), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const P = globalThis;
class w extends U {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = lt(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return H;
  }
}
var Be;
w._$litElement$ = !0, w.finalized = !0, (Be = P.litElementHydrateSupport) == null || Be.call(P, { LitElement: w });
const me = P.litElementPolyfillSupport;
me == null || me({ LitElement: w });
(P.litElementVersions ?? (P.litElementVersions = [])).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dt = { attribute: !0, type: String, converter: oe, reflect: !1, hasChanged: ge }, ct = (a = dt, e, t) => {
  const { kind: s, metadata: i } = t;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), s === "setter" && ((a = Object.create(a)).wrapped = !0), o.set(t.name, a), s === "accessor") {
    const { name: r } = t;
    return { set(n) {
      const d = e.get.call(this);
      e.set.call(this, n), this.requestUpdate(r, d, a);
    }, init(n) {
      return n !== void 0 && this.C(r, void 0, a, n), n;
    } };
  }
  if (s === "setter") {
    const { name: r } = t;
    return function(n) {
      const d = this[r];
      e.call(this, n), this.requestUpdate(r, d, a);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function y(a) {
  return (e, t) => typeof t == "object" ? ct(a, e, t) : ((s, i, o) => {
    const r = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, s), r ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(a, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function u(a) {
  return y({ ...a, state: !0, attribute: !1 });
}
var ht = Object.defineProperty, x = (a, e, t, s) => {
  for (var i = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (i = r(e, t, i) || i);
  return i && ht(e, t, i), i;
};
const be = class be extends w {
  constructor() {
    super(...arguments), this.open = !1, this.entities = [], this.preselected = null, this._name = "", this._temperatureSensor = "", this._heaters = /* @__PURE__ */ new Set(), this._coolers = /* @__PURE__ */ new Set(), this._windowSensors = /* @__PURE__ */ new Set(), this._roomType = "generic", this._filterByArea = !0, this._targetAreaId = null, this._targetAreaName = null;
  }
  updated(e) {
    if (e.has("open") && this.open && this.preselected) {
      const t = this.entities.find((s) => s.entity_id === this.preselected);
      if (t) {
        this._name = t.area_name || t.name || t.entity_id.split(".")[1], this._heaters.clear(), this._coolers.clear(), this._windowSensors.clear(), t.area_id ? (this._targetAreaId = t.area_id, this._targetAreaName = t.area_name || "Zone Area", this._filterByArea = !0) : (this._targetAreaId = null, this._targetAreaName = null, this._filterByArea = !1);
        const s = this._name.toLowerCase();
        s.includes("bedroom") || s.includes("sleeping") ? this._roomType = "bedroom" : s.includes("living") || s.includes("lounge") ? this._roomType = "living_room" : s.includes("office") || s.includes("study") ? this._roomType = "office" : this._roomType = "generic", t.domain === "climate" ? (this._heaters.add(t.entity_id), this._temperatureSensor = t.entity_id) : t.domain === "switch" && this._heaters.add(t.entity_id), this.requestUpdate();
      }
    }
  }
  _getEntityList(e) {
    let t = this.entities.filter((s) => e.includes(s.domain));
    return this._filterByArea && this._targetAreaId && (t = t.filter((s) => s.area_id === this._targetAreaId)), t;
  }
  _getSensors() {
    let e = this.entities.filter(
      (t) => t.domain === "sensor" && t.device_class === "temperature" || t.domain === "climate"
    );
    return this._filterByArea && this._targetAreaId && (e = e.filter((t) => t.area_id === this._targetAreaId)), e;
  }
  _toggleSet(e, t) {
    e.has(t) ? e.delete(t) : e.add(t), this.requestUpdate();
  }
  _save() {
    if (!this._name || !this._temperatureSensor) {
      alert("Name and Temperature Sensor are required.");
      return;
    }
    this.hass.callWS({
      type: "climate_dashboard/adopt",
      name: this._name,
      temperature_sensor: this._temperatureSensor,
      heaters: Array.from(this._heaters),
      coolers: Array.from(this._coolers),
      window_sensors: Array.from(this._windowSensors),
      room_type: this._roomType
    }), this.dispatchEvent(new CustomEvent("close"));
  }
  render() {
    const e = this._getEntityList(["climate", "switch"]), t = this._getEntityList(["climate"]), s = this._getEntityList(["binary_sensor"]), i = this._getSensors();
    return l`
      <div class="dialog">
        <div class="dialog-header">
          <h2>Adopt Zone</h2>
          ${this._targetAreaId ? l`
                <label class="filter-toggle">
                  <input
                    type="checkbox"
                    ?checked=${this._filterByArea}
                    @change=${(o) => this._filterByArea = o.target.checked}
                  />
                  Only ${this._targetAreaName}
                </label>
              ` : ""}
        </div>

        <div class="field">
          <label>Zone Name</label>
          <input
            type="text"
            .value=${this._name}
            @input=${(o) => this._name = o.target.value}
          />
        </div>

        <div class="field">
          <label>Room Type (Smart Schedule)</label>
          <select
            .value=${this._roomType}
            @change=${(o) => this._roomType = o.target.value}
          >
            <option value="generic">Generic (9-5)</option>
            <option value="bedroom">Bedroom (Cool sleep)</option>
            <option value="living_room">Living Room (Comfort evenings)</option>
            <option value="office">Home Office (Comfort workdays)</option>
          </select>
        </div>

        <div class="field">
          <label>Temperature Sensor</label>
          <select
            @change=${(o) => this._temperatureSensor = o.target.value}
          >
            <option value="">Select Sensor</option>
            ${i.map(
      (o) => l`
                <option
                  value="${o.entity_id}"
                  ?selected=${this._temperatureSensor === o.entity_id}
                >
                  ${o.name || o.entity_id} (${o.entity_id})
                </option>
              `
    )}
          </select>
        </div>

        <div class="field">
          <label>Heaters</label>
          <div class="checkbox-list">
            ${e.map(
      (o) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._heaters.has(o.entity_id)}
                    @change=${() => this._toggleSet(this._heaters, o.entity_id)}
                  />
                  <span>${o.name || o.entity_id} (${o.domain})</span>
                </div>
              `
    )}
            ${e.length === 0 ? l`<div style="color:var(--secondary-text-color)">
                  No heaters found in this area
                </div>` : ""}
          </div>
        </div>

        <div class="field">
          <label>Coolers</label>
          <div class="checkbox-list">
            ${t.map(
      (o) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._coolers.has(o.entity_id)}
                    @change=${() => this._toggleSet(this._coolers, o.entity_id)}
                  />
                  <span>${o.name || o.entity_id}</span>
                </div>
              `
    )}
            ${t.length === 0 ? l`<div style="color:var(--secondary-text-color)">
                  No coolers found in this area
                </div>` : ""}
          </div>
        </div>

        <div class="field">
          <label>Window Sensors</label>
          <div class="checkbox-list">
            ${s.map(
      (o) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._windowSensors.has(o.entity_id)}
                    @change=${() => this._toggleSet(this._windowSensors, o.entity_id)}
                  />
                  <span>${o.name || o.entity_id}</span>
                </div>
              `
    )}
            ${s.length === 0 ? l`<div style="color:var(--secondary-text-color)">
                  No window sensors found in this area
                </div>` : ""}
          </div>
        </div>

        <div class="actions">
          <button
            class="cancel"
            @click=${() => this.dispatchEvent(new CustomEvent("close"))}
          >
            Cancel
          </button>
          <button class="save" @click=${this._save}>Create Zone</button>
        </div>
      </div>
    `;
  }
};
be.styles = T`
    :host {
      display: none;
      position: fixed;
      z-index: 1000;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      align-items: center;
      justify-content: center;
    }
    :host([open]) {
      display: flex;
    }
    .dialog {
      background: var(--card-background-color, white);
      padding: 24px;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      color: var(--primary-text-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-height: 90vh;
      overflow-y: auto;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    h2 {
      margin: 0;
    }
    .filter-toggle {
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-color, #03a9f4);
      font-weight: 500;
    }
    .field {
      margin-bottom: 16px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    input[type="text"],
    select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
    }
    .checkbox-list {
      max-height: 150px;
      overflow-y: auto;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      padding: 8px;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
    }
    button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    .cancel {
      background: transparent;
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
    }
    .save {
      background: var(--primary-color, #03a9f4);
      color: white;
    }
  `;
let b = be;
x([
  y({ attribute: !1 })
], b.prototype, "hass");
x([
  y({ type: Boolean, reflect: !0 })
], b.prototype, "open");
x([
  y({ attribute: !1 })
], b.prototype, "entities");
x([
  y({ attribute: !1 })
], b.prototype, "preselected");
x([
  u()
], b.prototype, "_name");
x([
  u()
], b.prototype, "_temperatureSensor");
x([
  u()
], b.prototype, "_heaters");
x([
  u()
], b.prototype, "_coolers");
x([
  u()
], b.prototype, "_windowSensors");
x([
  u()
], b.prototype, "_roomType");
x([
  u()
], b.prototype, "_filterByArea");
x([
  u()
], b.prototype, "_targetAreaId");
x([
  u()
], b.prototype, "_targetAreaName");
customElements.get("adopt-dialog") || customElements.define("adopt-dialog", b);
var pt = Object.defineProperty, ee = (a, e, t, s) => {
  for (var i = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (i = r(e, t, i) || i);
  return i && pt(e, t, i), i;
};
const $e = class $e extends w {
  constructor() {
    super(...arguments), this._devices = [], this._loading = !1, this._dialogOpen = !1, this._selectedEntity = null;
  }
  firstUpdated() {
    this._fetchDevices();
  }
  async _fetchDevices() {
    if (this.hass) {
      this._loading = !0;
      try {
        this._devices = await this.hass.callWS({
          type: "climate_dashboard/scan"
        });
      } catch (e) {
        console.error("Failed to fetch devices", e);
      } finally {
        this._loading = !1;
      }
    }
  }
  render() {
    return l`
      <div class="card">
        <h2>Unmanaged Devices</h2>
        ${this._loading ? l`<p>Scanning...</p>` : this._renderList()}
      </div>

      <adopt-dialog
        .hass=${this.hass}
        .open=${this._dialogOpen}
        .entities=${this._devices}
        .preselected=${this._selectedEntity}
        @close=${this._closeDialog}
      ></adopt-dialog>
    `;
  }
  _renderList() {
    const e = this._devices.filter(
      (t) => ["climate", "switch"].includes(t.domain)
    );
    return e.length === 0 ? l`<div class="empty">No unmanaged actuators found.</div>` : l`
      <div class="list">
        ${e.map(
      (t) => l`
            <div class="item">
              <div class="item-info">
                <span class="icon">
                  <ha-icon
                    icon="${t.domain === "switch" ? "mdi:power-socket" : "mdi:thermostat"}"
                  ></ha-icon>
                </span>
                <div>
                  <div>${t.name || t.entity_id}</div>
                  <div
                    style="font-size: 0.8em; color: var(--secondary-text-color); display: flex; align-items: center; margin-top: 2px;"
                  >
                    ${t.area_name ? l`<span class="area-badge"
                          >${t.area_name}</span
                        >` : ""}
                    ${t.entity_id} • ${t.state}
                  </div>
                </div>
              </div>
              <button
                class="adopt-btn"
                @click=${() => this._openDialog(t.entity_id)}
              >
                Adopt
              </button>
            </div>
          `
    )}
      </div>
    `;
  }
  _openDialog(e) {
    this._selectedEntity = e, this._dialogOpen = !0;
  }
  _closeDialog() {
    this._dialogOpen = !1, this._selectedEntity = null, this._fetchDevices();
  }
};
$e.styles = T`
    :host {
      display: block;
      padding: 16px;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 16px;
      margin-bottom: 16px;
    }
    h2 {
      margin-top: 0;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border: 1px solid var(--divider-color, #eee);
      border-radius: 8px;
    }
    .item-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .icon {
      color: var(--state-climate-cool-color, #2b9af9);
    }
    .empty {
      text-align: center;
      color: var(--secondary-text-color);
      padding: 32px;
    }
    .area-badge {
      background: var(--primary-color, #03a9f4);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      margin-right: 6px;
    }
    .adopt-btn {
      background-color: var(--primary-color, #03a9f4);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .adopt-btn:hover {
      background-color: var(--primary-color-dark, #0288d1);
    }
  `;
let I = $e;
ee([
  y({ attribute: !1 })
], I.prototype, "hass");
ee([
  u()
], I.prototype, "_devices");
ee([
  u()
], I.prototype, "_loading");
ee([
  u()
], I.prototype, "_dialogOpen");
ee([
  u()
], I.prototype, "_selectedEntity");
customElements.get("setup-view") || customElements.define("setup-view", I);
var ut = Object.defineProperty, ye = (a, e, t, s) => {
  for (var i = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (i = r(e, t, i) || i);
  return i && ut(e, t, i), i;
};
const xe = class xe extends w {
  constructor() {
    super(...arguments), this._selectedDay = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
  }
  render() {
    if (!this.hass) return l``;
    const e = this._getGroupedZones(), t = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], s = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
    return l`
      <div class="card">
        <h2>Timeline</h2>

        <div class="day-selector">
          ${t.map(
      (i) => l`
              <button
                class="day-tab ${this._selectedDay === i ? "active" : ""}"
                @click=${() => this._selectedDay = i}
              >
                ${i.toUpperCase()}
              </button>
            `
    )}
        </div>

        ${e.length === 0 ? l`<p>No zones adopted yet.</p>` : l`
              <div class="timeline-container">
                <!-- Time Axis -->
                <div class="time-axis">
                  <div class="time-axis-spacer"></div>
                  <div class="time-axis-track">
                    ${[0, 4, 8, 12, 16, 20, 24].map(
      (i) => l`
                        <div
                          class="time-marker"
                          style="left: ${i / 24 * 100}%"
                        >
                          ${i.toString().padStart(2, "0")}:00
                        </div>
                      `
    )}
                  </div>
                </div>

                <!-- Zones -->
                ${e.map((i) => l`
                    ${i.floorName ? l`
                          <div class="floor-header">
                            <ha-icon
                              icon="${i.floorIcon || "mdi:home-floor-1"}"
                            ></ha-icon>
                            ${i.floorName}
                          </div>
                        ` : l``}
                    ${i.zones.map(
      (o) => this._renderZoneRow(o, this._selectedDay)
    )}
                  `)}

                <!-- Current Time Indicator (Only show if viewing today) -->
                ${this._selectedDay === s ? this._renderCurrentTimeLine() : ""}
              </div>
            `}
      </div>
    `;
  }
  _getGroupedZones() {
    if (!this.hass) return [];
    let e = Object.values(this.hass.states).filter(
      (r) => r.attributes.is_climate_dashboard_zone
    );
    if (this.focusZoneId)
      return e = e.filter((r) => r.entity_id === this.focusZoneId), [{ floorName: null, floorIcon: null, zones: e }];
    if (!this.hass.floors || Object.keys(this.hass.floors).length === 0)
      return e.length === 0 ? [] : [{ floorName: null, floorIcon: null, zones: e }];
    const t = {}, s = [];
    e.forEach((r) => {
      var p, m, f;
      const n = (p = this.hass.entities) == null ? void 0 : p[r.entity_id], d = n == null ? void 0 : n.area_id, c = d ? (m = this.hass.areas) == null ? void 0 : m[d] : null, h = c == null ? void 0 : c.floor_id;
      if (h && ((f = this.hass.floors) != null && f[h])) {
        const v = this.hass.floors[h];
        t[h] || (t[h] = {
          floorName: v.name,
          floorIcon: v.icon,
          level: v.level,
          zones: []
        }), t[h].zones.push(r);
      } else
        s.push(r);
    });
    const o = Object.values(t).sort((r, n) => r.level !== null && n.level !== null ? n.level - r.level : r.floorName.localeCompare(n.floorName)).map((r) => ({
      floorName: r.floorName,
      floorIcon: r.floorIcon,
      zones: r.zones
    }));
    return s.length > 0 && o.push({
      floorName: "Other Devices",
      floorIcon: "mdi:devices",
      zones: s
    }), o;
  }
  _renderZoneRow(e, t) {
    return l`
      <div class="zone-row" @click=${() => this._editSchedule(e.entity_id)}>
        <div class="zone-label">
          <div>${e.attributes.friendly_name || e.entity_id}</div>
          <div class="temp">
            ${e.attributes.current_temperature ?? "--"}°C ->
            ${e.attributes.temperature}°C
          </div>
        </div>

        <div class="timeline-track">${this._renderBlocks(e, t)}</div>
      </div>
    `;
  }
  _renderBlocks(e, t) {
    const s = e.attributes.schedule || [], i = (e.attributes.heaters || []).length > 0, o = (e.attributes.coolers || []).length > 0;
    let r = "off";
    i && o ? r = "auto" : i ? r = "heat" : o && (r = "cool");
    const n = s.filter(
      (c) => c.days.includes(t)
    );
    if (n.sort(
      (c, h) => c.start_time.localeCompare(h.start_time)
    ), (n.length > 0 ? n[0].start_time : "24:00") > "00:00") {
      const c = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], h = c.indexOf(t);
      let p = null;
      for (let m = 1; m <= 7; m++) {
        const f = (h - m + 7) % 7, v = c[f], M = s.filter(
          (q) => q.days.includes(v)
        );
        if (M.length > 0) {
          M.sort(
            (q, le) => q.start_time.localeCompare(le.start_time)
          ), p = M[M.length - 1];
          break;
        }
      }
      if (p) {
        const m = {
          ...p,
          start_time: "00:00",
          name: `Carry-over (${p.name})`
          // We render this block effectively from 00:00 to the start of the next block
        };
        n.unshift(m);
      }
    }
    return n.map((c, h) => {
      const [p, m] = c.start_time.split(":").map(Number), f = p * 60 + m;
      let v = 1440;
      if (h < n.length - 1) {
        const z = n[h + 1], [de, ce] = z.start_time.split(":").map(Number);
        v = de * 60 + ce;
      }
      const M = v - f, q = f / 1440 * 100, le = M / 1440 * 100;
      let B = "";
      const W = c.temp_heat ?? 20, te = c.temp_cool ?? 24, S = 16, ie = 24;
      let F = 1;
      if (r === "heat") {
        B = `${W}°`;
        const z = (W - S) / (ie - S);
        F = 0.4 + 0.6 * Math.min(Math.max(z, 0), 1);
      } else if (r === "cool") {
        B = `${te}°`;
        const z = (te - S) / (ie - S);
        F = 0.4 + 0.6 * Math.min(Math.max(z, 0), 1);
      } else if (r === "auto") {
        B = `${W}-${te}°`;
        const z = (W - S) / (ie - S), de = 0.4 + 0.6 * Math.min(Math.max(z, 0), 1), ce = (te - S) / (ie - S), Re = 0.4 + 0.6 * Math.min(Math.max(ce, 0), 1);
        F = Math.max(de, Re);
      } else
        B = `${W}°`, F = 0.5;
      return l`
        <div
          class="schedule-block mode-${r}"
          style="left: ${q}%; width: ${le}%; --block-opacity: ${F.toFixed(
        2
      )};"
          title="${c.name}: ${c.start_time} (${B})"
        >
          ${B}
        </div>
      `;
    });
  }
  _renderCurrentTimeLine() {
    const e = /* @__PURE__ */ new Date(), s = (e.getHours() * 60 + e.getMinutes()) / 1440 * 100;
    return l`
      <div
        class="current-time-line"
        style="left: calc(136px + (100% - 136px) * ${s / 100})"
      ></div>
    `;
  }
  _editSchedule(e) {
    this.dispatchEvent(
      new CustomEvent("schedule-selected", {
        detail: { entityId: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
xe.styles = T`
    /* ... existing styles ... */
    :host {
      display: block;
      padding: 16px;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    /* Rest of CSS same as before, omitted for brevity if replace works right */
    h2 {
      margin-top: 0;
      margin-bottom: 24px;
    }
    .day-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .day-tab {
      padding: 8px 16px;
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      background: transparent;
      cursor: pointer;
      font-weight: 500;
      color: var(--secondary-text-color);
      transition: all 0.2s;
    }
    .day-tab:hover {
      background: var(--secondary-background-color);
    }
    .day-tab.active {
      background: var(--primary-color, #03a9f4);
      color: white;
      border-color: var(--primary-color, #03a9f4);
    }
    .timeline-container {
      position: relative;
      margin-top: 20px;
    }
    /* Time Axis */
    .time-axis {
      display: flex;
      align-items: flex-end; /* Align labels to bottom */
      height: 24px;
      margin-bottom: 8px;
      font-size: 0.8em;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
    }
    .time-axis-spacer {
      width: 136px; /* 120px label + 16px padding */
      flex-shrink: 0;
    }
    .time-axis-track {
      flex: 1;
      position: relative;
      height: 100%;
    }
    .time-marker {
      position: absolute;
      bottom: 0;
      transform: translateX(-50%);
      white-space: nowrap;
    }
    .time-marker::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      height: 4px;
      width: 1px;
      background: var(--divider-color);
    }

    /* Zone Rows */
    .zone-row {
      display: flex;
      align-items: center;
      height: 48px;
      border-bottom: 1px solid var(--divider-color, #eee);
      position: relative;
      cursor: pointer;
    }
    .zone-row:hover {
      background-color: var(--secondary-background-color, #f5f5f5);
    }
    .zone-label {
      width: 120px;
      padding-right: 16px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 0;
    }
    .zone-label .temp {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      font-weight: normal;
    }

    /* Track Area */
    .timeline-track {
      flex: 1;
      position: relative;
      height: 32px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      overflow: hidden;
    }

    /* Blocks */
    .schedule-block {
      position: absolute;
      top: 0;
      bottom: 0;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75em;
      color: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      white-space: nowrap;
      transition: opacity 0.2s;
      z-index: 1; /* Create stacking context for ::before */
    }
    .schedule-block:hover {
      opacity: 0.9;
      z-index: 2;
    }
    /* Colors - Applied to ::before to allow independent opacity */
    .schedule-block::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 4px;
      z-index: -1;
      opacity: var(--block-opacity, 1);
      transition: opacity 0.2s;
    }

    .mode-heat::before {
      background-color: var(--deep-orange-color, #ff5722);
    }
    .mode-cool::before {
      background-color: var(--blue-color, #2196f3);
    }
    .mode-off::before {
      background-color: var(--grey-color, #9e9e9e);
    }
    .mode-auto::before {
      background: linear-gradient(
        to bottom,
        var(--blue-color, #2196f3) 50%,
        var(--deep-orange-color, #ff5722) 50%
      );
    }

    /* Current Time Indicator */
    .current-time-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: var(--primary-color, #03a9f4);
      z-index: 10;
      pointer-events: none;
    }
    .current-time-line::before {
      content: "";
      position: absolute;
      top: -4px;
      left: -1px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--primary-color, #03a9f4);
      box-shadow: 0 0 0 2px rgba(3, 169, 244, 0.3);
    }
    .floor-header {
      margin-top: 24px;
      margin-bottom: 8px;
      font-size: 1rem;
      font-weight: 500;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .floor-header ha-icon {
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }
    .floor-header:first-of-type {
      margin-top: 0;
    }
  `;
let L = xe;
ye([
  y({ attribute: !1 })
], L.prototype, "hass");
ye([
  y()
], L.prototype, "focusZoneId");
ye([
  u()
], L.prototype, "_selectedDay");
customElements.get("timeline-view") || customElements.define("timeline-view", L);
var mt = Object.defineProperty, ft = (a, e, t, s) => {
  for (var i = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (i = r(e, t, i) || i);
  return i && mt(e, t, i), i;
};
const we = class we extends w {
  render() {
    const e = this._getGroupedZones();
    return e.length === 0 ? l`
        <div class="empty">
          <p>No zones configured yet.</p>
          <p>Use the Setup button above to adopt devices.</p>
        </div>
      ` : l`
      <div class="grid">
        ${e.map((t) => l`
            ${t.floorName ? l`
                  <div class="floor-header">
                    <ha-icon
                      icon="${t.floorIcon || "mdi:home-floor-1"}"
                    ></ha-icon>
                    ${t.floorName}
                  </div>
                ` : l`<div class="floor-header">
                  <ha-icon icon="mdi:devices"></ha-icon>Other Devices
                </div>`}
            ${t.zones.map((s) => this._renderZoneCard(s))}
          `)}
      </div>
    `;
  }
  _getGroupedZones() {
    if (!this.hass) return [];
    const e = Object.values(this.hass.states).filter(
      (r) => r.entity_id.startsWith("climate.zone_")
    );
    if (!this.hass.floors || Object.keys(this.hass.floors).length === 0)
      return e.length === 0 ? [] : [{ floorName: null, floorIcon: null, zones: e }];
    const t = {}, s = [];
    e.forEach((r) => {
      var p, m, f;
      const n = (p = this.hass.entities) == null ? void 0 : p[r.entity_id], d = n == null ? void 0 : n.area_id, c = d ? (m = this.hass.areas) == null ? void 0 : m[d] : null, h = c == null ? void 0 : c.floor_id;
      if (h && ((f = this.hass.floors) != null && f[h])) {
        const v = this.hass.floors[h];
        t[h] || (t[h] = {
          floorName: v.name,
          floorIcon: v.icon,
          level: v.level,
          zones: []
        }), t[h].zones.push(r);
      } else
        s.push(r);
    });
    const o = Object.values(t).sort((r, n) => r.level !== null && n.level !== null ? n.level - r.level : r.floorName.localeCompare(n.floorName)).map((r) => ({
      floorName: r.floorName,
      floorIcon: r.floorIcon,
      zones: r.zones
    }));
    return s.length > 0 && o.push({
      floorName: null,
      floorIcon: null,
      zones: s
    }), o;
  }
  _renderZoneCard(e) {
    const t = e.attributes.hvac_action;
    let s = "mdi:thermostat", i = "";
    e.attributes.safety_mode ? (s = "mdi:alert-circle", i = "var(--error-color, #db4437)") : e.attributes.using_fallback_sensor ? (s = "mdi:thermometer-alert", i = "var(--warning-color, #ffa726)") : t === "heating" ? (s = "mdi:fire", i = "var(--deep-orange-color, #ff5722)") : t === "cooling" ? (s = "mdi:snowflake", i = "var(--blue-color, #2196f3)") : e.state === "heat" ? (s = "mdi:fire", i = "var(--primary-text-color)") : e.state === "auto" && (s = "mdi:calendar-clock");
    const o = e.attributes.current_temperature;
    return l`
      <div class="card" @click=${() => this._openDetails(e.entity_id)}>
        <button
          class="settings-btn"
          @click=${(r) => this._openSettings(r, e.entity_id)}
        >
          <ha-icon icon="mdi:cog"></ha-icon>
        </button>

        <div class="icon" style="color: ${i || "inherit"}">
          <ha-icon icon="${s}"></ha-icon>
        </div>
        <div class="name">
          ${e.attributes.friendly_name || e.entity_id}
        </div>
        <div class="temp">
          ${o != null ? `${o}°` : "--"}
        </div>
        <div class="state">
          ${t ? l`${t}` : l`${e.state}`}
        </div>

        ${this._renderStatus(e)}

        <div class="actions">
          <button
            class="mode-btn ${e.state === "off" ? "active" : ""}"
            @click=${(r) => this._setMode(r, e.entity_id, "off")}
          >
            Off
          </button>

          <button
            class="mode-btn ${e.state === "auto" ? "active" : ""}"
            @click=${(r) => this._setMode(r, e.entity_id, "auto")}
          >
            Auto
          </button>
        </div>
      </div>
    `;
  }
  _renderStatus(e) {
    const t = e.attributes.next_scheduled_change, s = e.attributes.manual_override_end, i = e.state;
    let o = "";
    if (e.attributes.safety_mode)
      o = "Sensor Unavailable: Safety Mode active";
    else if (e.attributes.using_fallback_sensor)
      o = "Warning: Using Area Fallback Sensor";
    else if (s)
      o = `Overridden until ${new Date(s).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}`;
    else if (e.attributes.open_window_sensor)
      o = `${e.attributes.open_window_sensor} open`;
    else if (i === "auto" && t) {
      const r = new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }), n = e.attributes.next_scheduled_temp;
      n != null ? o = `${r} -> ${n}°` : o = `${r}`;
    }
    return o ? l`
      <div
        style="font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px;"
      >
        ${o}
      </div>
    ` : l``;
  }
  async _setMode(e, t, s) {
    e.stopPropagation(), await this.hass.callService("climate", "set_hvac_mode", {
      entity_id: t,
      hvac_mode: s
    });
  }
  _openDetails(e) {
    this.dispatchEvent(
      new CustomEvent("zone-details", {
        detail: { entityId: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _openSettings(e, t) {
    e.stopPropagation(), this.dispatchEvent(
      new CustomEvent("zone-settings", {
        detail: { entityId: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
we.styles = T`
    :host {
      display: block;
      padding: 16px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 16px;
      cursor: pointer;
      transition: transform 0.1s;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
    }
    .card:active {
      transform: scale(0.98);
    }
    .icon {
      font-size: 24px;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }
    .icon.active {
      color: var(--state-climate-heat-color, #ff9800);
    }
    .name {
      font-weight: 500;
      margin-bottom: 4px;
      font-size: 1rem;
    }
    .temp {
      font-size: 1.5rem;
      font-weight: 300;
    }
    .state {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      margin-top: 4px;
      text-transform: capitalize;
    }
    .empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 32px;
      color: var(--secondary-text-color);
    }
    .actions {
      margin-top: 16px;
      display: flex;
      gap: 8px;
      width: 100%;
      justify-content: center;
    }
    .mode-btn {
      background: transparent;
      border: 1px solid var(--divider-color);
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 0.8rem;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: all 0.2s;
    }
    .mode-btn:hover {
      background: var(--secondary-background-color);
    }
    .mode-btn.active {
      background: var(--primary-color, #03a9f4);
      color: white;
      border-color: var(--primary-color, #03a9f4);
    }
    .settings-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      color: var(--secondary-text-color);
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
    }
    .settings-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .floor-header {
      grid-column: 1 / -1;
      margin-top: 24px;
      margin-bottom: 8px;
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .floor-header ha-icon {
      color: var(--secondary-text-color);
    }
    .floor-header:first-child {
      margin-top: 0;
    }
  `;
let ae = we;
ft([
  y({ attribute: !1 })
], ae.prototype, "hass");
customElements.get("zones-view") || customElements.define("zones-view", ae);
var _t = Object.defineProperty, $ = (a, e, t, s) => {
  for (var i = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (i = r(e, t, i) || i);
  return i && _t(e, t, i), i;
};
const Ae = class Ae extends w {
  constructor() {
    super(...arguments), this.allEntities = [], this._uniqueId = "", this._name = "", this._temperatureSensor = "", this._heaters = /* @__PURE__ */ new Set(), this._coolers = /* @__PURE__ */ new Set(), this._windowSensors = /* @__PURE__ */ new Set(), this._restoreDelayMinutes = 0, this._filterByArea = !0, this._zoneAreaId = null, this._zoneAreaName = null, this._loading = !1, this._error = "", this._showDeleteDialog = !1;
  }
  async firstUpdated() {
    await this._loadConfig();
  }
  async _loadConfig() {
    var r, n, d;
    if (!this.hass || !this.zoneId) return;
    this._loading = !0, console.log("Loading config for zoneId:", this.zoneId), this._zoneAreaId = null, this._zoneAreaName = null, this._filterByArea = !1;
    const e = this.hass.states[this.zoneId];
    if (!e) {
      console.error("Zone state not found for:", this.zoneId), this._error = "Zone not found", this._loading = !1;
      return;
    }
    if (console.log("Zone Attributes:", e.attributes), e.attributes.unique_id)
      this._uniqueId = e.attributes.unique_id;
    else
      try {
        const c = await this.hass.callWS({
          type: "config/entity_registry/get",
          entity_id: this.zoneId
        });
        this._uniqueId = c.unique_id, c.area_id && (this._zoneAreaId = c.area_id, this._filterByArea = !0);
      } catch (c) {
        console.warn("Could not fetch registry entry:", c);
      }
    if (this._uniqueId && !this._zoneAreaId && ((n = (r = this.hass.entities) == null ? void 0 : r[this.zoneId]) != null && n.area_id) && (this._zoneAreaId = this.hass.entities[this.zoneId].area_id, this._filterByArea = !0), this._zoneAreaId && ((d = this.hass.areas) != null && d[this._zoneAreaId]) && (this._zoneAreaName = this.hass.areas[this._zoneAreaId].name), !this._uniqueId) {
      this._error = "Could not determine Unique ID", this._loading = !1;
      return;
    }
    const t = e.attributes;
    this._name = t.friendly_name || "", this._temperatureSensor = t.temperature_sensor || t.sensor_entity_id || "";
    const s = t.heaters || (t.actuator_entity_id ? [t.actuator_entity_id] : []);
    this._heaters = new Set(s);
    const i = t.coolers || [];
    this._coolers = new Set(i);
    const o = t.window_sensors || [];
    this._windowSensors = new Set(o), this._restoreDelayMinutes = t.restore_delay_minutes || 0, console.log("Loaded Config:", {
      name: this._name,
      temp: this._temperatureSensor,
      heaters: this._heaters,
      coolers: this._coolers,
      restore: this._restoreDelayMinutes
    }), this._loading = !1;
  }
  _toggleSet(e, t) {
    e.has(t) ? e.delete(t) : e.add(t), this.requestUpdate();
  }
  _getEntityList(e) {
    let t = this.allEntities.filter((s) => e.includes(s.domain));
    return this._filterByArea && this._zoneAreaId && (t = t.filter((s) => s.area_id === this._zoneAreaId)), t;
  }
  async _save() {
    if (!this._name || !this._temperatureSensor) {
      alert("Name and Temperature Sensor are required.");
      return;
    }
    try {
      await this.hass.callWS({
        type: "climate_dashboard/update",
        unique_id: this._uniqueId,
        name: this._name,
        temperature_sensor: this._temperatureSensor,
        heaters: Array.from(this._heaters),
        coolers: Array.from(this._coolers),
        window_sensors: Array.from(this._windowSensors),
        restore_delay_minutes: Number(this._restoreDelayMinutes)
      }), this._goBack();
    } catch (e) {
      alert("Update failed: " + e.message);
    }
  }
  async _deleteConfirm() {
    try {
      await this.hass.callWS({
        type: "climate_dashboard/delete",
        unique_id: this._uniqueId
      }), this._goBack();
    } catch (e) {
      console.error("[ZoneEditor] Delete failed:", e), alert("Delete failed: " + e.message);
    } finally {
      this._showDeleteDialog = !1;
    }
  }
  _goBack() {
    this.dispatchEvent(new CustomEvent("close"));
  }
  render() {
    if (this._loading) return l`<div class="card">Loading...</div>`;
    if (this._error) return l`<div class="card">Error: ${this._error}</div>`;
    const e = this._getEntityList(["climate", "switch"]), t = this._getEntityList(["climate"]), s = this._getEntityList(["binary_sensor"]);
    let i = this.allEntities.filter(
      (o) => o.domain === "sensor" && o.device_class === "temperature" || o.domain === "climate"
    );
    return this._filterByArea && this._zoneAreaId && (i = i.filter(
      (o) => o.area_id === this._zoneAreaId
    )), l`
      <div class="card">
        <h2>
          Edit Zone: ${this._name}
          ${this._zoneAreaId ? l`
                <label
                  style="font-size: 0.9rem; display: flex; align-items: center; gap: 6px; color: var(--primary-color);"
                >
                  <input
                    type="checkbox"
                    ?checked=${this._filterByArea}
                    @change=${(o) => this._filterByArea = o.target.checked}
                  />
                  Only ${this._zoneAreaName}
                </label>
              ` : ""}
        </h2>

        <div class="field">
          <label>Zone Name</label>
          <input
            type="text"
            .value=${this._name}
            @input=${(o) => this._name = o.target.value}
          />
        </div>

        <div class="field">
          <label>Temperature Sensor</label>
          <select
            @change=${(o) => this._temperatureSensor = o.target.value}
          >
            <option value="">Select Sensor</option>
            ${i.map(
      (o) => l`
                <option
                  value="${o.entity_id}"
                  ?selected=${this._temperatureSensor === o.entity_id}
                >
                  ${o.name || o.entity_id} (${o.entity_id})
                </option>
              `
    )}
          </select>
        </div>

        <div class="field">
          <label>Heaters</label>
          <div class="checkbox-list">
            ${e.map(
      (o) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._heaters.has(o.entity_id)}
                    @change=${() => this._toggleSet(this._heaters, o.entity_id)}
                  />
                  <span>${o.name} (${o.entity_id})</span>
                </div>
              `
    )}
          </div>
        </div>

        <div class="field">
          <label>Coolers</label>
          <div class="checkbox-list">
            ${t.map(
      (o) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._coolers.has(o.entity_id)}
                    @change=${() => this._toggleSet(this._coolers, o.entity_id)}
                  />
                  <span>${o.name || o.entity_id}</span>
                </div>
              `
    )}
          </div>
        </div>

        <div class="field">
          <label>Window Sensors</label>
          <div class="checkbox-list">
            ${s.map(
      (o) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._windowSensors.has(o.entity_id)}
                    @change=${() => this._toggleSet(this._windowSensors, o.entity_id)}
                  />
                  <span>${o.name || o.entity_id}</span>
                </div>
              `
    )}
          </div>
        </div>

        <div class="field">
          <label>Auto-Restore Delay (Minutes)</label>
          <div
            style="font-size: 0.8em; color: var(--secondary-text-color); margin-bottom: 4px;"
          >
            Automatically revert to Auto/Schedule after this many minutes. Set
            to 0 to disable.
          </div>
          <input
            type="number"
            min="0"
            .value=${this._restoreDelayMinutes}
            @input=${(o) => this._restoreDelayMinutes = o.target.value}
          />
        </div>

        <div class="actions">
          <button
            class="delete"
            @click=${() => this._showDeleteDialog = !0}
          >
            Delete
          </button>
          <div style="flex: 1"></div>
          <button class="cancel" @click=${this._goBack}>Cancel</button>
          <button class="save" @click=${this._save}>Save</button>
        </div>

        <!-- Confirmation Dialog -->
        <ha-dialog
          .open=${this._showDeleteDialog}
          @closed=${() => this._showDeleteDialog = !1}
          heading="Delete Zone"
        >
          <div>
            Are you sure you want to delete <strong>${this._name}</strong>? This
            action cannot be undone.
          </div>
          <div slot="secondaryAction">
            <button
              class="dialog-btn"
              @click=${() => this._showDeleteDialog = !1}
            >
              Cancel
            </button>
          </div>
          <div slot="primaryAction">
            <button
              class="dialog-btn delete-confirm"
              @click=${this._deleteConfirm}
            >
              Delete
            </button>
          </div>
        </ha-dialog>
      </div>
    `;
  }
};
Ae.styles = T`
    :host {
      display: block;
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }
    h2 {
      margin-top: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .field {
      margin-bottom: 16px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    input[type="text"],
    input[type="number"],
    select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }
    .checkbox-list {
      max-height: 150px;
      overflow-y: auto;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      padding: 8px;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 32px;
      border-top: 1px solid var(--divider-color, #eee);
      padding-top: 16px;
    }
    button {
      padding: 10px 24px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.875rem;
    }
    .cancel {
      background: transparent;
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
    }
    .save {
      background: var(--primary-color, #03a9f4);
      color: white;
    }
    .dialog-btn {
      background: transparent;
      border: none;
      color: var(--primary-color, #03a9f4);
      font-weight: 500;
      text-transform: uppercase;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      letter-spacing: 0.0892857143em;
    }
    .dialog-btn.delete-confirm {
      color: var(--error-color, #f44336);
    }
    .dialog-btn:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    .delete {
      background: var(--error-color, #f44336);
      color: white;
      margin-right: auto;
    }
  `;
let _ = Ae;
$([
  y({ attribute: !1 })
], _.prototype, "hass");
$([
  y({ attribute: !1 })
], _.prototype, "zoneId");
$([
  y({ attribute: !1 })
], _.prototype, "allEntities");
$([
  u()
], _.prototype, "_uniqueId");
$([
  u()
], _.prototype, "_name");
$([
  u()
], _.prototype, "_temperatureSensor");
$([
  u()
], _.prototype, "_heaters");
$([
  u()
], _.prototype, "_coolers");
$([
  u()
], _.prototype, "_windowSensors");
$([
  u()
], _.prototype, "_restoreDelayMinutes");
$([
  u()
], _.prototype, "_filterByArea");
$([
  u()
], _.prototype, "_zoneAreaId");
$([
  u()
], _.prototype, "_zoneAreaName");
$([
  u()
], _.prototype, "_loading");
$([
  u()
], _.prototype, "_error");
$([
  u()
], _.prototype, "_showDeleteDialog");
customElements.get("zone-editor") || customElements.define("zone-editor", _);
var gt = Object.defineProperty, Z = (a, e, t, s) => {
  for (var i = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (i = r(e, t, i) || i);
  return i && gt(e, t, i), i;
};
const vt = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], ke = class ke extends w {
  constructor() {
    super(...arguments), this._schedule = [], this._loading = !1, this._uniqueId = "", this._config = {};
  }
  async firstUpdated() {
    await this._loadConfig();
  }
  async _loadConfig() {
    if (!(!this.hass || !this.zoneId)) {
      this._loading = !0;
      try {
        const e = await this.hass.callWS({
          type: "config/entity_registry/get",
          entity_id: this.zoneId
        });
        this._uniqueId = e.unique_id;
        const t = this.hass.states[this.zoneId];
        if (t && t.attributes.schedule) {
          const s = JSON.parse(
            JSON.stringify(t.attributes.schedule)
          );
          this._schedule = s.map((i) => ({
            ...i,
            temp_heat: i.temp_heat ?? 20,
            temp_cool: i.temp_cool ?? 24
          })), this._config = {
            name: t.attributes.friendly_name,
            temperature_sensor: t.attributes.temperature_sensor,
            heaters: t.attributes.heaters || [],
            coolers: t.attributes.coolers || [],
            window_sensors: t.attributes.window_sensors || []
          };
        }
      } catch (e) {
        console.error(e), alert("Failed to load schedule");
      }
      this._loading = !1;
    }
  }
  _addBlock() {
    this._schedule = [
      ...this._schedule,
      {
        name: "New Block",
        start_time: "08:00",
        temp_heat: 20,
        temp_cool: 24,
        days: ["mon", "tue", "wed", "thu", "fri"]
      }
    ];
  }
  _removeBlock(e) {
    this._schedule = this._schedule.filter((t, s) => s !== e);
  }
  _updateBlock(e, t, s) {
    const i = [...this._schedule];
    i[e] = { ...i[e], [t]: s }, this._schedule = i;
  }
  _toggleDay(e, t) {
    const s = this._schedule[e], i = new Set(s.days);
    i.has(t) ? i.delete(t) : i.add(t), this._updateBlock(e, "days", Array.from(i));
  }
  async _save() {
    try {
      await this.hass.callWS({
        type: "climate_dashboard/update",
        unique_id: this._uniqueId,
        name: this._config.name,
        // Required fields
        temperature_sensor: this._config.temperature_sensor,
        heaters: this._config.heaters,
        coolers: this._config.coolers,
        window_sensors: this._config.window_sensors,
        schedule: this._schedule
      }), this.dispatchEvent(new CustomEvent("close"));
    } catch (e) {
      alert("Save failed: " + e.message);
    }
  }
  render() {
    return this._loading ? l`<div>Loading...</div>` : l`
      <div class="card">
        <h2>Schedule: ${this._config.name}</h2>
        <div class="block-list">
          ${this._schedule.map(
      (e, t) => l`
              <div class="block-item">
                <div class="block-header">
                  <span>Block ${t + 1}</span>
                  <button
                    class="delete-btn"
                    @click=${() => this._removeBlock(t)}
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>

                <div class="row">
                  <div class="field">
                    <label>Name</label>
                    <input
                      type="text"
                      .value=${e.name}
                      @input=${(s) => this._updateBlock(t, "name", s.target.value)}
                    />
                  </div>
                  <div class="field">
                    <label>Start Time</label>
                    <input
                      type="time"
                      .value=${e.start_time}
                      @input=${(s) => this._updateBlock(t, "start_time", s.target.value)}
                    />
                  </div>
                  ${this._config.heaters.length > 0 ? l`
                        <div class="field">
                          <label>Heat To (°C)</label>
                          <input
                            type="number"
                            step="0.5"
                            .value=${e.temp_heat ?? 20}
                            @input=${(s) => this._updateBlock(
        t,
        "temp_heat",
        parseFloat(s.target.value)
      )}
                          />
                        </div>
                      ` : ""}
                  ${this._config.coolers.length > 0 ? l`
                        <div class="field">
                          <label>Cool To (°C)</label>
                          <input
                            type="number"
                            step="0.5"
                            .value=${e.temp_cool ?? 24}
                            @input=${(s) => this._updateBlock(
        t,
        "temp_cool",
        parseFloat(s.target.value)
      )}
                          />
                        </div>
                      ` : ""}
                </div>

                <div class="row">
                  <div class="field" style="flex: 2;">
                    <label>Days</label>
                    <div class="days-selector">
                      ${vt.map(
        (s) => l`
                          <button
                            class="day-btn ${e.days.includes(s) ? "active" : ""}"
                            @click=${() => this._toggleDay(t, s)}
                          >
                            ${s.toUpperCase()}
                          </button>
                        `
      )}
                    </div>
                  </div>
                </div>
              </div>
            `
    )}
        </div>

        <button class="add-btn" @click=${this._addBlock}>
          <ha-icon icon="mdi:plus"></ha-icon> Add Time Block
        </button>

        <div class="actions">
          <button
            class="cancel"
            @click=${() => this.dispatchEvent(new CustomEvent("close"))}
          >
            Cancel
          </button>
          <button class="save" @click=${this._save}>Save Schedule</button>
        </div>
      </div>
    `;
  }
};
ke.styles = T`
    :host {
      display: block;
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }
    h2 {
      margin-top: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .block-list {
      margin-top: 20px;
    }
    .block-item {
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
    .row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
    .field {
      flex: 1;
      min-width: 120px;
    }
    label {
      display: block;
      font-size: 0.8em;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }
    input,
    select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }
    .days-selector {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .day-btn {
      padding: 6px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8em;
      background: transparent;
      flex: 1;
      min-width: 40px;
      text-align: center;
    }
    .day-btn.active {
      background: var(--primary-color, #03a9f4);
      color: white;
      border-color: var(--primary-color, #03a9f4);
    }
    .actions {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }
    button {
      padding: 10px 24px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      text-transform: uppercase;
    }
    .add-btn {
      background: var(--primary-color);
      color: white;
      width: 100%;
      margin-top: 10px;
    }
    .save {
      background: var(--primary-color);
      color: white;
    }
    .cancel {
      background: transparent;
      border: 1px solid var(--divider-color);
    }
    .delete-btn {
      color: var(--error-color, red);
      background: none;
      padding: 4px;
    }
  `;
let A = ke;
Z([
  y({ attribute: !1 })
], A.prototype, "hass");
Z([
  y({ attribute: !1 })
], A.prototype, "zoneId");
Z([
  u()
], A.prototype, "_schedule");
Z([
  u()
], A.prototype, "_loading");
Z([
  u()
], A.prototype, "_uniqueId");
Z([
  u()
], A.prototype, "_config");
customElements.get("schedule-editor") || customElements.define("schedule-editor", A);
var yt = Object.defineProperty, R = (a, e, t, s) => {
  for (var i = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (i = r(e, t, i) || i);
  return i && yt(e, t, i), i;
};
const Se = class Se extends w {
  constructor() {
    super(...arguments), this._view = "zones", this._editingZoneId = null, this._unmanagedCount = 0;
  }
  // ... (omitted) ...
  firstUpdated() {
    this._scanForBadge();
  }
  async _scanForBadge() {
    if (this.hass)
      try {
        const t = (await this.hass.callWS({
          type: "climate_dashboard/scan"
        })).filter(
          (s) => ["climate", "switch"].includes(s.domain)
        );
        this._unmanagedCount = t.length;
      } catch (e) {
        console.error("Badge scan failed", e);
      }
  }
  _getEditorCandidates() {
    if (!this.hass) return [];
    const e = ["climate", "switch", "sensor", "binary_sensor"];
    return Object.values(this.hass.states).filter(
      (t) => e.includes(t.entity_id.split(".")[0]) && !t.attributes.is_climate_dashboard_zone && !t.entity_id.startsWith("climate.zone_")
    ).map((t) => {
      var s, i;
      return {
        entity_id: t.entity_id,
        domain: t.entity_id.split(".")[0],
        name: t.attributes.friendly_name || t.entity_id,
        device_class: t.attributes.device_class,
        area_id: (i = (s = this.hass.entities) == null ? void 0 : s[t.entity_id]) == null ? void 0 : i.area_id
      };
    });
  }
  render() {
    return l`
      <div class="header">
        ${this._view !== "zones" ? l`
              <button
                class="icon-btn"
                @click=${() => {
      this._view === "schedule" ? (this._view = "timeline", this._editingZoneId = null) : (this._view = "zones", this._editingZoneId = null);
    }}
              >
                <ha-icon icon="mdi:arrow-left"></ha-icon>
              </button>
            ` : l`<ha-menu-button
              .hass=${this.hass}
              .narrow=${this.narrow}
            ></ha-menu-button>`}

        <div class="title">Climate</div>

        <div class="actions">
          <!-- Timeline Toggle -->
          <button
            class="icon-btn ${this._view === "timeline" ? "active" : ""}"
            @click=${() => this._view = "timeline"}
          >
            <ha-icon icon="mdi:chart-timeline"></ha-icon>
          </button>

          <!-- Setup Toggle (Badge) -->
          <button
            class="icon-btn ${this._view === "setup" ? "active" : ""}"
            @click=${() => this._view = "setup"}
          >
            <ha-icon icon="mdi:cog"></ha-icon>
            ${this._unmanagedCount > 0 ? l`<span class="badge">${this._unmanagedCount}</span>` : ""}
          </button>
        </div>
      </div>

      <div class="content">
        ${this._view === "zones" ? l`<zones-view
              .hass=${this.hass}
              @zone-settings=${(e) => {
      this._editingZoneId = e.detail.entityId, this._view = "editor";
    }}
              @zone-details=${(e) => {
      this._editingZoneId = e.detail.entityId, this._view = "timeline";
    }}
            ></zones-view>` : ""}
        ${this._view === "setup" ? l`<setup-view .hass=${this.hass}></setup-view>` : ""}
        ${this._view === "timeline" ? l` <timeline-view
              .hass=${this.hass}
              .focusZoneId=${this._editingZoneId}
              @schedule-selected=${(e) => {
      this._editingZoneId = e.detail.entityId, this._view = "schedule";
    }}
            ></timeline-view>` : ""}
        ${this._view === "editor" && this._editingZoneId ? l`
              <zone-editor
                .hass=${this.hass}
                .zoneId=${this._editingZoneId}
                .allEntities=${this._getEditorCandidates()}
                @close=${() => {
      this._view = "zones", this._editingZoneId = null;
    }}
              ></zone-editor>
            ` : ""}
        ${this._view === "schedule" && this._editingZoneId ? l`
              <schedule-editor
                .hass=${this.hass}
                .zoneId=${this._editingZoneId}
                @close=${() => {
      this._view = "timeline", this._editingZoneId = null;
    }}
              ></schedule-editor>
            ` : ""}
      </div>
    `;
  }
};
Se.styles = T`
    :host {
      display: flex;
      flex-direction: column;
      background-color: var(--primary-background-color);
      min-height: 100vh;
      font-family: var(--paper-font-body1_-_font-family);
    }
    .header {
      background: var(--app-header-background-color, #03a9f4);
      color: var(--app-header-text-color, white);
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      box-sizing: border-box;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .title {
      font-size: 20px;
      font-weight: 500;
      flex: 1;
    }
    .actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .icon-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      position: relative;
      padding: 8px;
      border-radius: 50%;
    }
    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .icon-btn.active {
      color: var(--primary-text-color, white);
      background: rgba(255, 255, 255, 0.2);
    }
    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--error-color, #f44336);
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .content {
      flex: 1;
      overflow-y: auto;
    }
  `;
let k = Se;
R([
  y({ attribute: !1 })
], k.prototype, "hass");
R([
  y({ attribute: !1 })
], k.prototype, "narrow");
R([
  y({ attribute: !1 })
], k.prototype, "panel");
R([
  u()
], k.prototype, "_view");
R([
  u()
], k.prototype, "_editingZoneId");
R([
  u()
], k.prototype, "_unmanagedCount");
customElements.get("climate-dashboard") || customElements.define("climate-dashboard", k);
console.info(
  "%c CLIMATE-DASHBOARD %c 0.0.1 ",
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;"
);
