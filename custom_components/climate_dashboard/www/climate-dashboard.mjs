/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oe = globalThis, me = oe.ShadowRoot && (oe.ShadyCSS === void 0 || oe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ge = Symbol(), Se = /* @__PURE__ */ new WeakMap();
let He = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== ge) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (me && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = Se.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Se.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const We = (a) => new He(typeof a == "string" ? a : a + "", void 0, ge), P = (a, ...e) => {
  const t = a.length === 1 ? a[0] : e.reduce((i, s, o) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + a[o + 1], a[0]);
  return new He(t, a, ge);
}, Fe = (a, e) => {
  if (me) a.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), s = oe.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = t.cssText, a.appendChild(i);
  }
}, Ee = me ? (a) => a : (a) => a instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return We(t);
})(a) : a;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ge, defineProperty: Ve, getOwnPropertyDescriptor: Je, getOwnPropertyNames: Ke, getOwnPropertySymbols: Xe, getPrototypeOf: Ye } = Object, D = globalThis, Ie = D.trustedTypes, Qe = Ie ? Ie.emptyScript : "", he = D.reactiveElementPolyfillSupport, J = (a, e) => a, re = { toAttribute(a, e) {
  switch (e) {
    case Boolean:
      a = a ? Qe : null;
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
} }, fe = (a, e) => !Ge(a, e), De = { attribute: !0, type: String, converter: re, reflect: !1, useDefault: !1, hasChanged: fe };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), D.litPropertyMetadata ?? (D.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let j = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = De) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(e, i, t);
      s !== void 0 && Ve(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: s, set: o } = Je(this.prototype, e) ?? { get() {
      return this[t];
    }, set(r) {
      this[t] = r;
    } };
    return { get: s, set(r) {
      const l = s == null ? void 0 : s.call(this);
      o == null || o.call(this, r), this.requestUpdate(e, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? De;
  }
  static _$Ei() {
    if (this.hasOwnProperty(J("elementProperties"))) return;
    const e = Ye(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(J("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(J("properties"))) {
      const t = this.properties, i = [...Ke(t), ...Xe(t)];
      for (const s of i) this.createProperty(s, t[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, s] of t) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const s = this._$Eu(t, i);
      s !== void 0 && this._$Eh.set(s, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const s of i) t.unshift(Ee(s));
    } else e !== void 0 && t.push(Ee(e));
    return t;
  }
  static _$Eu(e, t) {
    const i = t.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const i of t.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Fe(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var i;
      return (i = t.hostConnected) == null ? void 0 : i.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var i;
      return (i = t.hostDisconnected) == null ? void 0 : i.call(t);
    });
  }
  attributeChangedCallback(e, t, i) {
    this._$AK(e, i);
  }
  _$ET(e, t) {
    var o;
    const i = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, i);
    if (s !== void 0 && i.reflect === !0) {
      const r = (((o = i.converter) == null ? void 0 : o.toAttribute) !== void 0 ? i.converter : re).toAttribute(t, i.type);
      this._$Em = e, r == null ? this.removeAttribute(s) : this.setAttribute(s, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var o, r;
    const i = this.constructor, s = i._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const l = i.getPropertyOptions(s), c = typeof l.converter == "function" ? { fromAttribute: l.converter } : ((o = l.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? l.converter : re;
      this._$Em = s;
      const d = c.fromAttribute(t, l.type);
      this[s] = d ?? ((r = this._$Ej) == null ? void 0 : r.get(s)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, t, i) {
    var s;
    if (e !== void 0) {
      const o = this.constructor, r = this[e];
      if (i ?? (i = o.getPropertyOptions(e)), !((i.hasChanged ?? fe)(r, t) || i.useDefault && i.reflect && r === ((s = this._$Ej) == null ? void 0 : s.get(e)) && !this.hasAttribute(o._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: s, wrapped: o }, r) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, r ?? t ?? this[e]), o !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), s === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [o, r] of s) {
        const { wrapped: l } = r, c = this[o];
        l !== !0 || this._$AL.has(o) || c === void 0 || this.C(o, void 0, r, c);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (i = this._$EO) == null || i.forEach((s) => {
        var o;
        return (o = s.hostUpdate) == null ? void 0 : o.call(s);
      }), this.update(t)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((i) => {
      var s;
      return (s = i.hostUpdated) == null ? void 0 : s.call(i);
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
j.elementStyles = [], j.shadowRootOptions = { mode: "open" }, j[J("elementProperties")] = /* @__PURE__ */ new Map(), j[J("finalized")] = /* @__PURE__ */ new Map(), he == null || he({ ReactiveElement: j }), (D.reactiveElementVersions ?? (D.reactiveElementVersions = [])).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis, ae = K.trustedTypes, ze = ae ? ae.createPolicy("lit-html", { createHTML: (a) => a }) : void 0, Ue = "$lit$", I = `lit$${Math.random().toFixed(9).slice(2)}$`, je = "?" + I, et = `<${je}>`, T = document, X = () => T.createComment(""), Y = (a) => a === null || typeof a != "object" && typeof a != "function", ve = Array.isArray, tt = (a) => ve(a) || typeof (a == null ? void 0 : a[Symbol.iterator]) == "function", pe = `[ 	
\f\r]`, V = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ne = /-->/g, Me = />/g, N = RegExp(`>|${pe}(?:([^\\s"'>=/]+)(${pe}*=${pe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Oe = /'/g, Te = /"/g, Le = /^(?:script|style|textarea|title)$/i, it = (a) => (e, ...t) => ({ _$litType$: a, strings: e, values: t }), n = it(1), L = Symbol.for("lit-noChange"), f = Symbol.for("lit-nothing"), Pe = /* @__PURE__ */ new WeakMap(), M = T.createTreeWalker(T, 129);
function Ze(a, e) {
  if (!ve(a) || !a.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ze !== void 0 ? ze.createHTML(e) : e;
}
const st = (a, e) => {
  const t = a.length - 1, i = [];
  let s, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = V;
  for (let l = 0; l < t; l++) {
    const c = a[l];
    let d, h, u = -1, _ = 0;
    for (; _ < c.length && (r.lastIndex = _, h = r.exec(c), h !== null); ) _ = r.lastIndex, r === V ? h[1] === "!--" ? r = Ne : h[1] !== void 0 ? r = Me : h[2] !== void 0 ? (Le.test(h[2]) && (s = RegExp("</" + h[2], "g")), r = N) : h[3] !== void 0 && (r = N) : r === N ? h[0] === ">" ? (r = s ?? V, u = -1) : h[1] === void 0 ? u = -2 : (u = r.lastIndex - h[2].length, d = h[1], r = h[3] === void 0 ? N : h[3] === '"' ? Te : Oe) : r === Te || r === Oe ? r = N : r === Ne || r === Me ? r = V : (r = N, s = void 0);
    const m = r === N && a[l + 1].startsWith("/>") ? " " : "";
    o += r === V ? c + et : u >= 0 ? (i.push(d), c.slice(0, u) + Ue + c.slice(u) + I + m) : c + I + (u === -2 ? l : m);
  }
  return [Ze(a, o + (a[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Q {
  constructor({ strings: e, _$litType$: t }, i) {
    let s;
    this.parts = [];
    let o = 0, r = 0;
    const l = e.length - 1, c = this.parts, [d, h] = st(e, t);
    if (this.el = Q.createElement(d, i), M.currentNode = this.el.content, t === 2 || t === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (s = M.nextNode()) !== null && c.length < l; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const u of s.getAttributeNames()) if (u.endsWith(Ue)) {
          const _ = h[r++], m = s.getAttribute(u).split(I), $ = /([.?@])?(.*)/.exec(_);
          c.push({ type: 1, index: o, name: $[2], strings: m, ctor: $[1] === "." ? rt : $[1] === "?" ? at : $[1] === "@" ? nt : ne }), s.removeAttribute(u);
        } else u.startsWith(I) && (c.push({ type: 6, index: o }), s.removeAttribute(u));
        if (Le.test(s.tagName)) {
          const u = s.textContent.split(I), _ = u.length - 1;
          if (_ > 0) {
            s.textContent = ae ? ae.emptyScript : "";
            for (let m = 0; m < _; m++) s.append(u[m], X()), M.nextNode(), c.push({ type: 2, index: ++o });
            s.append(u[_], X());
          }
        }
      } else if (s.nodeType === 8) if (s.data === je) c.push({ type: 2, index: o });
      else {
        let u = -1;
        for (; (u = s.data.indexOf(I, u + 1)) !== -1; ) c.push({ type: 7, index: o }), u += I.length - 1;
      }
      o++;
    }
  }
  static createElement(e, t) {
    const i = T.createElement("template");
    return i.innerHTML = e, i;
  }
}
function Z(a, e, t = a, i) {
  var r, l;
  if (e === L) return e;
  let s = i !== void 0 ? (r = t._$Co) == null ? void 0 : r[i] : t._$Cl;
  const o = Y(e) ? void 0 : e._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== o && ((l = s == null ? void 0 : s._$AO) == null || l.call(s, !1), o === void 0 ? s = void 0 : (s = new o(a), s._$AT(a, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = s : t._$Cl = s), s !== void 0 && (e = Z(a, s._$AS(a, e.values), s, i)), e;
}
class ot {
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
    const { el: { content: t }, parts: i } = this._$AD, s = ((e == null ? void 0 : e.creationScope) ?? T).importNode(t, !0);
    M.currentNode = s;
    let o = M.nextNode(), r = 0, l = 0, c = i[0];
    for (; c !== void 0; ) {
      if (r === c.index) {
        let d;
        c.type === 2 ? d = new te(o, o.nextSibling, this, e) : c.type === 1 ? d = new c.ctor(o, c.name, c.strings, this, e) : c.type === 6 && (d = new lt(o, this, e)), this._$AV.push(d), c = i[++l];
      }
      r !== (c == null ? void 0 : c.index) && (o = M.nextNode(), r++);
    }
    return M.currentNode = T, s;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class te {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, i, s) {
    this.type = 2, this._$AH = f, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = s, this._$Cv = (s == null ? void 0 : s.isConnected) ?? !0;
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
    e = Z(this, e, t), Y(e) ? e === f || e == null || e === "" ? (this._$AH !== f && this._$AR(), this._$AH = f) : e !== this._$AH && e !== L && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : tt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== f && Y(this._$AH) ? this._$AA.nextSibling.data = e : this.T(T.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var o;
    const { values: t, _$litType$: i } = e, s = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Q.createElement(Ze(i.h, i.h[0]), this.options)), i);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === s) this._$AH.p(t);
    else {
      const r = new ot(s, this), l = r.u(this.options);
      r.p(t), this.T(l), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = Pe.get(e.strings);
    return t === void 0 && Pe.set(e.strings, t = new Q(e)), t;
  }
  k(e) {
    ve(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, s = 0;
    for (const o of e) s === t.length ? t.push(i = new te(this.O(X()), this.O(X()), this, this.options)) : i = t[s], i._$AI(o), s++;
    s < t.length && (this._$AR(i && i._$AB.nextSibling, s), t.length = s);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, t); e !== this._$AB; ) {
      const s = e.nextSibling;
      e.remove(), e = s;
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
  constructor(e, t, i, s, o) {
    this.type = 1, this._$AH = f, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = f;
  }
  _$AI(e, t = this, i, s) {
    const o = this.strings;
    let r = !1;
    if (o === void 0) e = Z(this, e, t, 0), r = !Y(e) || e !== this._$AH && e !== L, r && (this._$AH = e);
    else {
      const l = e;
      let c, d;
      for (e = o[0], c = 0; c < o.length - 1; c++) d = Z(this, l[i + c], t, c), d === L && (d = this._$AH[c]), r || (r = !Y(d) || d !== this._$AH[c]), d === f ? e = f : e !== f && (e += (d ?? "") + o[c + 1]), this._$AH[c] = d;
    }
    r && !s && this.j(e);
  }
  j(e) {
    e === f ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class rt extends ne {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === f ? void 0 : e;
  }
}
class at extends ne {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== f);
  }
}
class nt extends ne {
  constructor(e, t, i, s, o) {
    super(e, t, i, s, o), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = Z(this, e, t, 0) ?? f) === L) return;
    const i = this._$AH, s = e === f && i !== f || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, o = e !== f && (i === f || s);
    s && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class lt {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Z(this, e);
  }
}
const ue = K.litHtmlPolyfillSupport;
ue == null || ue(Q, te), (K.litHtmlVersions ?? (K.litHtmlVersions = [])).push("3.3.1");
const ct = (a, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let s = i._$litPart$;
  if (s === void 0) {
    const o = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = s = new te(e.insertBefore(X(), o), o, void 0, t ?? {});
  }
  return s._$AI(a), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis;
class A extends j {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ct(t, this.renderRoot, this.renderOptions);
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
    return L;
  }
}
var Be;
A._$litElement$ = !0, A.finalized = !0, (Be = O.litElementHydrateSupport) == null || Be.call(O, { LitElement: A });
const _e = O.litElementPolyfillSupport;
_e == null || _e({ LitElement: A });
(O.litElementVersions ?? (O.litElementVersions = [])).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dt = { attribute: !0, type: String, converter: re, reflect: !1, hasChanged: fe }, ht = (a = dt, e, t) => {
  const { kind: i, metadata: s } = t;
  let o = globalThis.litPropertyMetadata.get(s);
  if (o === void 0 && globalThis.litPropertyMetadata.set(s, o = /* @__PURE__ */ new Map()), i === "setter" && ((a = Object.create(a)).wrapped = !0), o.set(t.name, a), i === "accessor") {
    const { name: r } = t;
    return { set(l) {
      const c = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(r, c, a);
    }, init(l) {
      return l !== void 0 && this.C(r, void 0, a, l), l;
    } };
  }
  if (i === "setter") {
    const { name: r } = t;
    return function(l) {
      const c = this[r];
      e.call(this, l), this.requestUpdate(r, c, a);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function y(a) {
  return (e, t) => typeof t == "object" ? ht(a, e, t) : ((i, s, o) => {
    const r = s.hasOwnProperty(o);
    return s.constructor.createProperty(o, i), r ? Object.getOwnPropertyDescriptor(s, o) : void 0;
  })(a, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function p(a) {
  return y({ ...a, state: !0, attribute: !1 });
}
var pt = Object.defineProperty, x = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && pt(e, t, s), s;
};
const be = class be extends A {
  constructor() {
    super(...arguments), this.open = !1, this.entities = [], this.preselected = null, this._name = "", this._temperatureSensor = "", this._heaters = /* @__PURE__ */ new Set(), this._coolers = /* @__PURE__ */ new Set(), this._windowSensors = /* @__PURE__ */ new Set(), this._roomType = "generic", this._filterByArea = !0, this._targetAreaId = null, this._targetAreaName = null, this._circuits = [], this._selectedCircuit = "";
  }
  updated(e) {
    if (e.has("open") && this.open && this.preselected) {
      const t = this.entities.find((i) => i.entity_id === this.preselected);
      if (t) {
        this._name = t.area_name || t.name || t.entity_id.split(".")[1], this._heaters.clear(), this._coolers.clear(), this._windowSensors.clear(), t.area_id ? (this._targetAreaId = t.area_id, this._targetAreaName = t.area_name || "Zone Area", this._filterByArea = !0) : (this._targetAreaId = null, this._targetAreaName = null, this._filterByArea = !1);
        const i = this._name.toLowerCase();
        i.includes("bedroom") || i.includes("sleeping") ? this._roomType = "bedroom" : i.includes("living") || i.includes("lounge") ? this._roomType = "living_room" : i.includes("office") || i.includes("study") ? this._roomType = "office" : this._roomType = "generic", t.domain === "climate" ? (this._heaters.add(t.entity_id), this._temperatureSensor = t.entity_id) : t.domain === "switch" && this._heaters.add(t.entity_id), this.hass.callWS({ type: "climate_dashboard/circuit/list" }).then((s) => {
          this._circuits = s, this._selectedCircuit && !s.find((o) => o.id === this._selectedCircuit) && (this._selectedCircuit = "");
        }), this.requestUpdate();
      }
    }
  }
  _getEntityList(e) {
    let t = this.entities.filter((i) => e.includes(i.domain));
    return this._filterByArea && this._targetAreaId && (t = t.filter((i) => i.area_id === this._targetAreaId)), t;
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
      room_type: this._roomType,
      circuit_ids: this._selectedCircuit ? [this._selectedCircuit] : []
    }), this.dispatchEvent(new CustomEvent("close"));
  }
  render() {
    const e = this._getEntityList(["climate", "switch"]), t = this._getEntityList(["climate"]), i = this._getEntityList(["binary_sensor"]), s = this._getSensors();
    return n`
      <div class="dialog">
        <div class="dialog-header">
          <h2>Adopt Zone</h2>
          ${this._targetAreaId ? n`
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
          <label>Heating Circuit</label>
          <select
            .value=${this._selectedCircuit}
            @change=${(o) => this._selectedCircuit = o.target.value}
          >
            <option value="">None (Independent)</option>
            ${this._circuits.map(
      (o) => n`<option value="${o.id}">${o.name}</option>`
    )}
          </select>
        </div>

        <div class="field">
          <label>Temperature Sensor</label>
          <select
            @change=${(o) => this._temperatureSensor = o.target.value}
          >
            <option value="">Select Sensor</option>
            ${s.map(
      (o) => n`
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
      (o) => n`
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
            ${e.length === 0 ? n`<div style="color:var(--secondary-text-color)">
                  No heaters found in this area
                </div>` : ""}
          </div>
        </div>

        <div class="field">
          <label>Coolers</label>
          <div class="checkbox-list">
            ${t.map(
      (o) => n`
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
            ${t.length === 0 ? n`<div style="color:var(--secondary-text-color)">
                  No coolers found in this area
                </div>` : ""}
          </div>
        </div>

        <div class="field">
          <label>Window Sensors</label>
          <div class="checkbox-list">
            ${i.map(
      (o) => n`
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
            ${i.length === 0 ? n`<div style="color:var(--secondary-text-color)">
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
be.styles = P`
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
let v = be;
x([
  y({ attribute: !1 })
], v.prototype, "hass");
x([
  y({ type: Boolean, reflect: !0 })
], v.prototype, "open");
x([
  y({ attribute: !1 })
], v.prototype, "entities");
x([
  y({ attribute: !1 })
], v.prototype, "preselected");
x([
  p()
], v.prototype, "_name");
x([
  p()
], v.prototype, "_temperatureSensor");
x([
  p()
], v.prototype, "_heaters");
x([
  p()
], v.prototype, "_coolers");
x([
  p()
], v.prototype, "_windowSensors");
x([
  p()
], v.prototype, "_roomType");
x([
  p()
], v.prototype, "_filterByArea");
x([
  p()
], v.prototype, "_targetAreaId");
x([
  p()
], v.prototype, "_targetAreaName");
x([
  p()
], v.prototype, "_circuits");
x([
  p()
], v.prototype, "_selectedCircuit");
customElements.get("adopt-dialog") || customElements.define("adopt-dialog", v);
var ut = Object.defineProperty, k = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && ut(e, t, s), s;
};
const $e = class $e extends A {
  constructor() {
    super(...arguments), this._devices = [], this._loading = !1, this._settings = {
      default_override_type: "next_block",
      default_timer_minutes: 60,
      window_open_delay_seconds: 30,
      home_away_entity_id: null,
      away_delay_minutes: 10,
      away_temperature: 16,
      away_temperature_cool: 30,
      is_away_mode_on: !1
    }, this._circuits = [], this._circuitDialogOpen = !1, this._editingCircuit = null, this._tempCircuitName = "", this._tempCircuitHeaters = [], this._dialogOpen = !1, this._selectedEntity = null;
  }
  firstUpdated() {
    this._fetchDevices(), this._fetchSettings(), this._fetchCircuits();
  }
  async _fetchCircuits() {
    if (this.hass)
      try {
        this._circuits = await this.hass.callWS({
          type: "climate_dashboard/circuit/list"
        });
      } catch (e) {
        console.error("Failed to fetch circuits", e);
      }
  }
  async _deleteCircuit(e) {
    if (confirm("Delete this circuit?"))
      try {
        await this.hass.callWS({
          type: "climate_dashboard/circuit/delete",
          circuit_id: e
        }), this._fetchCircuits();
      } catch (t) {
        alert("Failed to delete: " + t);
      }
  }
  _openCircuitDialog(e) {
    e ? (this._editingCircuit = e, this._tempCircuitName = e.name, this._tempCircuitHeaters = [...e.heaters]) : (this._editingCircuit = null, this._tempCircuitName = "", this._tempCircuitHeaters = []), this._circuitDialogOpen = !0;
  }
  async _saveCircuit() {
    if (!this._tempCircuitName) return alert("Name required");
    const e = {
      name: this._tempCircuitName,
      heaters: this._tempCircuitHeaters
    };
    try {
      this._editingCircuit ? (e.type = "climate_dashboard/circuit/update", e.id = this._editingCircuit.id) : e.type = "climate_dashboard/circuit/create", await this.hass.callWS(e), this._circuitDialogOpen = !1, this._fetchCircuits();
    } catch (t) {
      alert("Error: " + t);
    }
  }
  async _fetchSettings() {
    if (this.hass)
      try {
        this._settings = await this.hass.callWS({
          type: "climate_dashboard/settings/get"
        });
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
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
    return n`
      <div class="card">
        <h2>System Settings</h2>
        <div class="settings-row">
          <label>Default Override Behavior</label>
          <select
            .value=${this._settings.default_override_type}
            @change=${(e) => this._updateSetting(
      "default_override_type",
      e.target.value
    )}
          >
            <option value="next_block">Until Next Schedule</option>
            <option value="duration">Timer (Fixed Duration)</option>
          </select>
        </div>

        ${this._settings.default_override_type === "duration" ? n`
              <div class="settings-row">
                <label>Default Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="720"
                  step="5"
                  .value=${this._settings.default_timer_minutes}
                  @change=${(e) => this._updateSetting(
      "default_timer_minutes",
      parseInt(e.target.value)
    )}
                />
              </div>
            ` : ""}

        <div class="settings-row">
          <label>Door/Window Open Delay (seconds)</label>
          <input
            type="number"
            min="0"
            max="300"
            step="5"
            .value=${this._settings.window_open_delay_seconds}
            @change=${(e) => this._updateSetting(
      "window_open_delay_seconds",
      parseInt(e.target.value)
    )}
          />
        </div>

        <h3>Home/Away Automation</h3>

        <div class="settings-row">
          <label>Presence Entity (Optional)</label>
          <input
            type="text"
            placeholder="group.family"
            .value=${this._settings.home_away_entity_id || ""}
            @change=${(e) => this._updateSetting(
      "home_away_entity_id",
      e.target.value || null
    )}
          />
        </div>

        <div class="settings-row">
          <label>Away Delay (minutes)</label>
          <input
            type="number"
            min="1"
            max="60"
            step="1"
            .value=${this._settings.away_delay_minutes}
            @change=${(e) => this._updateSetting(
      "away_delay_minutes",
      parseInt(e.target.value)
    )}
          />
        </div>

        <div class="settings-row">
          <label>Away Heat Temperature (°C)</label>
          <input
            type="number"
            min="5"
            max="30"
            step="0.5"
            .value=${this._settings.away_temperature}
            @change=${(e) => this._updateSetting(
      "away_temperature",
      parseFloat(e.target.value)
    )}
          />
        </div>

        <div class="settings-row">
          <label>Away Cool Temperature (°C)</label>
          <input
            type="number"
            min="16"
            max="35"
            step="0.5"
            .value=${this._settings.away_temperature_cool || 30}
            @change=${(e) => this._updateSetting(
      "away_temperature_cool",
      parseFloat(e.target.value)
    )}
          />
        </div>
      </div>

      <div class="card">
        <div
          style="display:flex; justify-content:space-between; align-items:center"
        >
          <h2>Heating Circuits</h2>
          <button class="adopt-btn" @click=${() => this._openCircuitDialog()}>
            + Create
          </button>
        </div>
        ${this._circuits.length === 0 ? n`<div class="empty">No circuits defined.</div>` : n`<div class="list">
              ${this._circuits.map(
      (e) => n`
                  <div class="circuit-item">
                    <div>
                      <strong>${e.name}</strong>
                      <div
                        style="font-size:0.8em; color:var(--secondary-text-color)"
                      >
                        Heaters: ${e.heaters.join(", ") || "None"}
                      </div>
                    </div>
                    <div class="circuit-actions">
                      <button
                        style="background:none; border:none; color:blue; cursor:pointer"
                        @click=${() => this._openCircuitDialog(e)}
                      >
                        Edit
                      </button>
                      <button
                        style="background:none; border:none; color:red; cursor:pointer"
                        @click=${() => this._deleteCircuit(e.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                `
    )}
            </div>`}
      </div>

      ${this._renderCircuitDialog()}

      <div class="card">
        <h2>Unmanaged Devices</h2>
        ${this._loading ? n`<p>Scanning...</p>` : this._renderList()}
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
    return e.length === 0 ? n`<div class="empty">No unmanaged actuators found.</div>` : n`
      <div class="list">
        ${e.map(
      (t) => n`
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
                    ${t.area_name ? n`<span class="area-badge"
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
  async _updateSetting(e, t) {
    this._settings = { ...this._settings, [e]: t };
    try {
      await this.hass.callWS({
        type: "climate_dashboard/settings/update",
        [e]: t
      });
    } catch (i) {
      console.error("Failed to update settings", i), this._fetchSettings();
    }
  }
  _renderCircuitDialog() {
    if (!this._circuitDialogOpen) return n``;
    const e = this._devices.filter(
      (t) => ["switch", "climate"].includes(t.domain)
    );
    return n`
      <div
        style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; justify-content:center; align-items:center"
      >
        <div
          style="background:var(--card-background-color, white); padding:20px; border-radius:12px; width: 400px; max-width:90%"
        >
          <h2>${this._editingCircuit ? "Edit Circuit" : "Create Circuit"}</h2>

          <div style="margin-bottom:16px">
            <label style="display:block; margin-bottom:4px">Name</label>
            <input
              type="text"
              style="width:100%"
              .value=${this._tempCircuitName}
              @input=${(t) => this._tempCircuitName = t.target.value}
            />
          </div>

          <div style="margin-bottom:16px">
            <label style="display:block; margin-bottom:4px"
              >Shared Heaters (Boilers/Pumps)</label
            >
            <div
              style="max-height:150px; overflow-y:auto; border:1px solid #ccc; padding:8px; border-radius:4px"
            >
              ${e.map(
      (t) => n`
                  <div
                    style="display:flex; align-items:center; gap:8px; margin-bottom:4px"
                  >
                    <input
                      type="checkbox"
                      .checked=${this._tempCircuitHeaters.includes(t.entity_id)}
                      @change=${(i) => {
        i.target.checked ? this._tempCircuitHeaters = [
          ...this._tempCircuitHeaters,
          t.entity_id
        ] : this._tempCircuitHeaters = this._tempCircuitHeaters.filter(
          (s) => s !== t.entity_id
        );
      }}
                    />
                    <span>${t.name || t.entity_id}</span>
                  </div>
                `
    )}
            </div>
          </div>

          <div
            style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px"
          >
            <button
              class="adopt-btn"
              style="background:#ccc; color:black"
              @click=${() => this._circuitDialogOpen = !1}
            >
              Cancel
            </button>
            <button class="adopt-btn" @click=${this._saveCircuit}>Save</button>
          </div>
        </div>
      </div>
    `;
  }
};
$e.styles = P`
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
    .circuit-item {
      border: 1px solid var(--divider-color);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .circuit-actions ha-icon-button {
      color: var(--secondary-text-color);
    }
    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .settings-row label {
      font-weight: 500;
    }
    select,
    input {
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
    }
  `;
let w = $e;
k([
  y({ attribute: !1 })
], w.prototype, "hass");
k([
  p()
], w.prototype, "_devices");
k([
  p()
], w.prototype, "_loading");
k([
  p()
], w.prototype, "_settings");
k([
  p()
], w.prototype, "_circuits");
k([
  p()
], w.prototype, "_circuitDialogOpen");
k([
  p()
], w.prototype, "_editingCircuit");
k([
  p()
], w.prototype, "_tempCircuitName");
k([
  p()
], w.prototype, "_tempCircuitHeaters");
k([
  p()
], w.prototype, "_dialogOpen");
k([
  p()
], w.prototype, "_selectedEntity");
customElements.get("setup-view") || customElements.define("setup-view", w);
var _t = Object.defineProperty, ye = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && _t(e, t, s), s;
};
const xe = class xe extends A {
  constructor() {
    super(...arguments), this._selectedDay = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
  }
  render() {
    try {
      if (!this.hass) return n``;
      const e = this._getGroupedZones(), t = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], i = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
      return n`
        <div class="card">
          <h2>Timeline</h2>

          <div class="day-selector">
            ${t.map(
        (s) => n`
                <button
                  class="day-tab ${this._selectedDay === s ? "active" : ""}"
                  @click=${() => this._selectedDay = s}
                >
                  ${s.toUpperCase()}
                </button>
              `
      )}
          </div>

          ${e.length === 0 ? n`<p>No zones adopted yet.</p>` : n`
                <div class="timeline-container">
                  <!-- Time Axis -->
                  <div class="time-axis">
                    <div class="time-axis-spacer"></div>
                    <div class="time-axis-track">
                      ${[0, 4, 8, 12, 16, 20, 24].map(
        (s) => n`
                          <div
                            class="time-marker"
                            style="left: ${s / 24 * 100}%"
                          >
                            ${s.toString().padStart(2, "0")}:00
                          </div>
                        `
      )}
                    </div>
                  </div>

                  <!-- Zones -->
                  ${e.map((s) => n`
                      ${s.floorName ? n`
                            <div class="floor-header">
                              <ha-icon
                                icon="${s.floorIcon || "mdi:home-floor-1"}"
                              ></ha-icon>
                              ${s.floorName}
                            </div>
                          ` : n``}
                      ${s.zones.map(
        (o) => this._renderZoneRow(o, this._selectedDay)
      )}
                    `)}

                  <!-- Current Time Indicator (Only show if viewing today) -->
                  ${this._selectedDay === i ? this._renderCurrentTimeLine() : ""}
                </div>
              `}
        </div>
      `;
    } catch (e) {
      return console.error("Error rendering TimelineView:", e), n`<div class="error">Error loading timeline</div>`;
    }
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
    const t = {}, i = [];
    e.forEach((r) => {
      var u, _, m;
      const l = (u = this.hass.entities) == null ? void 0 : u[r.entity_id], c = l == null ? void 0 : l.area_id, d = c ? (_ = this.hass.areas) == null ? void 0 : _[c] : null, h = d == null ? void 0 : d.floor_id;
      if (h && ((m = this.hass.floors) != null && m[h])) {
        const $ = this.hass.floors[h];
        t[h] || (t[h] = {
          floorName: $.name,
          floorIcon: $.icon,
          level: $.level,
          zones: []
        }), t[h].zones.push(r);
      } else
        i.push(r);
    });
    const o = Object.values(t).sort((r, l) => r.level !== null && l.level !== null ? l.level - r.level : r.floorName.localeCompare(l.floorName)).map((r) => ({
      floorName: r.floorName,
      floorIcon: r.floorIcon,
      zones: r.zones
    }));
    return i.length > 0 && o.push({
      floorName: "Other Devices",
      floorIcon: "mdi:devices",
      zones: i
    }), o;
  }
  _renderZoneRow(e, t) {
    return n`
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
    const i = e.attributes.schedule || [], s = (e.attributes.heaters || []).length > 0, o = (e.attributes.coolers || []).length > 0;
    let r = "off";
    s && o ? r = "auto" : s ? r = "heat" : o && (r = "cool");
    const l = i.filter(
      (d) => d.days.includes(t)
    );
    if (l.sort(
      (d, h) => d.start_time.localeCompare(h.start_time)
    ), (l.length > 0 ? l[0].start_time : "24:00") > "00:00") {
      const d = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], h = d.indexOf(t);
      let u = null;
      for (let _ = 1; _ <= 7; _++) {
        const m = (h - _ + 7) % 7, $ = d[m], H = i.filter(
          (W) => W.days.includes($)
        );
        if (H.length > 0) {
          H.sort(
            (W, le) => W.start_time.localeCompare(le.start_time)
          ), u = H[H.length - 1];
          break;
        }
      }
      if (u) {
        const _ = {
          ...u,
          start_time: "00:00",
          name: `Carry-over (${u.name})`
          // We render this block effectively from 00:00 to the start of the next block
        };
        l.unshift(_);
      }
    }
    return l.map((d, h) => {
      const [u, _] = d.start_time.split(":").map(Number), m = u * 60 + _;
      let $ = 1440;
      if (h < l.length - 1) {
        const z = l[h + 1], [ce, de] = z.start_time.split(":").map(Number);
        $ = ce * 60 + de;
      }
      const H = $ - m, W = m / 1440 * 100, le = H / 1440 * 100;
      let U = "";
      const F = d.temp_heat ?? 20, ie = d.temp_cool ?? 24, E = 16, se = 24;
      let G = 1;
      if (r === "heat") {
        U = `${F}°`;
        const z = (F - E) / (se - E);
        G = 0.4 + 0.6 * Math.min(Math.max(z, 0), 1);
      } else if (r === "cool") {
        U = `${ie}°`;
        const z = (ie - E) / (se - E);
        G = 0.4 + 0.6 * Math.min(Math.max(z, 0), 1);
      } else if (r === "auto") {
        U = `${F}-${ie}°`;
        const z = (F - E) / (se - E), ce = 0.4 + 0.6 * Math.min(Math.max(z, 0), 1), de = (ie - E) / (se - E), Re = 0.4 + 0.6 * Math.min(Math.max(de, 0), 1);
        G = Math.max(ce, Re);
      } else
        U = `${F}°`, G = 0.5;
      return n`
        <div
          class="schedule-block mode-${r}"
          style="left: ${W}%; width: ${le}%; --block-opacity: ${G.toFixed(
        2
      )};"
          title="${d.name}: ${d.start_time} (${U})"
        >
          ${U}
        </div>
      `;
    });
  }
  _renderCurrentTimeLine() {
    const e = /* @__PURE__ */ new Date(), i = (e.getHours() * 60 + e.getMinutes()) / 1440 * 100;
    return n`
      <div
        class="current-time-line"
        style="left: calc(136px + (100% - 136px) * ${i / 100})"
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
xe.styles = P`
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
let q = xe;
ye([
  y({ attribute: !1 })
], q.prototype, "hass");
ye([
  y()
], q.prototype, "focusZoneId");
ye([
  p()
], q.prototype, "_selectedDay");
customElements.get("timeline-view") || customElements.define("timeline-view", q);
var mt = Object.defineProperty, qe = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && mt(e, t, s), s;
};
const we = class we extends A {
  constructor() {
    super(...arguments), this.isAwayMode = !1;
  }
  render() {
    try {
      const e = this._getGroupedZones();
      return e.length === 0 ? n`
          <div class="empty">
            <p>No zones configured yet.</p>
            <p>Use the Setup button above to adopt devices.</p>
          </div>
        ` : n`
        <div class="grid">
          ${e.map((t) => n`
              ${t.floorName ? n`
                    <div class="floor-header">
                      <ha-icon
                        icon="${t.floorIcon || "mdi:home-floor-1"}"
                      ></ha-icon>
                      ${t.floorName}
                    </div>
                  ` : n`<div class="floor-header">
                    <ha-icon icon="mdi:devices"></ha-icon>Other Devices
                  </div>`}
              ${t.zones.map((i) => this._renderZoneCard(i))}
            `)}
        </div>
      `;
    } catch (e) {
      return console.error("Error rendering ZonesView:", e), n`<div class="error">Error loading zones</div>`;
    }
  }
  _getGroupedZones() {
    if (!this.hass) return [];
    const e = Object.values(this.hass.states).filter(
      (r) => r.entity_id.startsWith("climate.zone_")
    );
    if (!this.hass.floors || Object.keys(this.hass.floors).length === 0)
      return e.length === 0 ? [] : [{ floorName: null, floorIcon: null, zones: e }];
    const t = {}, i = [];
    e.forEach((r) => {
      var u, _, m;
      const l = (u = this.hass.entities) == null ? void 0 : u[r.entity_id], c = l == null ? void 0 : l.area_id, d = c ? (_ = this.hass.areas) == null ? void 0 : _[c] : null, h = d == null ? void 0 : d.floor_id;
      if (h && ((m = this.hass.floors) != null && m[h])) {
        const $ = this.hass.floors[h];
        t[h] || (t[h] = {
          floorName: $.name,
          floorIcon: $.icon,
          level: $.level,
          zones: []
        }), t[h].zones.push(r);
      } else
        i.push(r);
    });
    const o = Object.values(t).sort((r, l) => r.level !== null && l.level !== null ? l.level - r.level : r.floorName.localeCompare(l.floorName)).map((r) => ({
      floorName: r.floorName,
      floorIcon: r.floorIcon,
      zones: r.zones
    }));
    return i.length > 0 && o.push({
      floorName: null,
      floorIcon: null,
      zones: i
    }), o;
  }
  _renderZoneCard(e) {
    const t = e.attributes.hvac_action;
    let i = "mdi:thermostat", s = "";
    e.attributes.safety_mode ? (i = "mdi:alert-circle", s = "var(--error-color, #db4437)") : e.attributes.using_fallback_sensor ? (i = "mdi:thermometer-alert", s = "var(--warning-color, #ffa726)") : t === "heating" ? (i = "mdi:fire", s = "var(--deep-orange-color, #ff5722)") : t === "cooling" ? (i = "mdi:snowflake", s = "var(--blue-color, #2196f3)") : e.state === "heat" ? (i = "mdi:fire", s = "var(--primary-text-color)") : e.state === "auto" && (i = "mdi:calendar-clock");
    const o = e.attributes.current_temperature;
    return n`
      <div class="card" @click=${() => this._openDetails(e.entity_id)}>
        <button
          class="settings-btn"
          @click=${(r) => this._openSettings(r, e.entity_id)}
        >
          <ha-icon icon="mdi:cog"></ha-icon>
        </button>

        <div class="icon" style="color: ${s || "inherit"}">
          <ha-icon icon="${i}"></ha-icon>
        </div>
        <div class="name">
          ${e.attributes.friendly_name || e.entity_id}
        </div>
        <div class="temp">
          ${o != null ? `${o}°` : "--"}
        </div>
        <div class="state">
          ${t ? n`${t}` : n`${e.state}`}
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
    const t = e.attributes.next_scheduled_change, i = e.attributes.override_end, s = e.attributes.override_type, o = e.state;
    let r = "";
    if (e.attributes.safety_mode)
      r = "Sensor Unavailable: Safety Mode active";
    else if (e.attributes.using_fallback_sensor)
      r = "Warning: Using Area Fallback Sensor";
    else if (e.attributes.open_window_sensor)
      r = `${e.attributes.open_window_sensor} open`;
    else if (this.isAwayMode)
      e.attributes.target_temp_low != null && e.attributes.target_temp_high != null ? r = `Away ${e.attributes.target_temp_low}°/${e.attributes.target_temp_high}°` : r = `Away ${e.attributes.temperature}°`;
    else if (i) {
      const l = new Date(i).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      s === "duration" ? r = `Timer until ${l}` : r = `Until ${l}`;
    } else if (o === "auto" && t) {
      const l = new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }), c = e.attributes.next_scheduled_temp_heat, d = e.attributes.next_scheduled_temp_cool, h = e.attributes.hvac_modes || [], u = h.includes("heat"), _ = h.includes("cool");
      let m = n``;
      if (u && _ && c != null && d != null ? m = n`<span class="heat">${c}°</span>/<span class="cool"
            >${d}°</span
          >` : u && c != null ? m = n`<span class="heat">${c}°</span>` : _ && d != null && (m = n`<span class="cool">${d}°</span>`), u && c != null || _ && d != null)
        return n`
          <div
            style="font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px;"
          >
            ${l} -> ${m}
          </div>
        `;
      r = `${l}`;
    }
    return r ? n`
      <div
        style="font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px;"
      >
        ${r}
      </div>
    ` : n``;
  }
  async _setMode(e, t, i) {
    e.stopPropagation(), await this.hass.callService("climate", "set_hvac_mode", {
      entity_id: t,
      hvac_mode: i
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
we.styles = P`
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
    .heat {
      color: var(--state-climate-heat-color, #ff9800);
      font-weight: 500;
    }
    .cool {
      color: var(--state-climate-cool-color, #2196f3);
      font-weight: 500;
    }
  `;
let ee = we;
qe([
  y({ attribute: !1 })
], ee.prototype, "hass");
qe([
  y({ type: Boolean })
], ee.prototype, "isAwayMode");
customElements.get("zones-view") || customElements.define("zones-view", ee);
var gt = Object.defineProperty, b = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && gt(e, t, s), s;
};
const Ae = class Ae extends A {
  constructor() {
    super(...arguments), this.allEntities = [], this._uniqueId = "", this._name = "", this._temperatureSensor = "", this._heaters = /* @__PURE__ */ new Set(), this._coolers = /* @__PURE__ */ new Set(), this._windowSensors = /* @__PURE__ */ new Set(), this._restoreDelayMinutes = 0, this._filterByArea = !0, this._zoneAreaId = null, this._zoneAreaName = null, this._circuits = [], this._selectedCircuitId = "", this._loading = !1, this._error = "", this._showDeleteDialog = !1;
  }
  async firstUpdated() {
    await this._loadConfig();
  }
  async _loadConfig() {
    var l, c, d;
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
        const h = await this.hass.callWS({
          type: "config/entity_registry/get",
          entity_id: this.zoneId
        });
        this._uniqueId = h.unique_id, h.area_id && (this._zoneAreaId = h.area_id, this._filterByArea = !0);
      } catch (h) {
        console.warn("Could not fetch registry entry:", h);
      }
    if (this._uniqueId && !this._zoneAreaId && ((c = (l = this.hass.entities) == null ? void 0 : l[this.zoneId]) != null && c.area_id) && (this._zoneAreaId = this.hass.entities[this.zoneId].area_id, this._filterByArea = !0), this._zoneAreaId && ((d = this.hass.areas) != null && d[this._zoneAreaId]) && (this._zoneAreaName = this.hass.areas[this._zoneAreaId].name), !this._uniqueId) {
      this._error = "Could not determine Unique ID", this._loading = !1;
      return;
    }
    const t = e.attributes;
    this._name = t.friendly_name || "", this._temperatureSensor = t.temperature_sensor || t.sensor_entity_id || "";
    const i = t.heaters || (t.actuator_entity_id ? [t.actuator_entity_id] : []);
    this._heaters = new Set(i);
    const s = t.coolers || [];
    this._coolers = new Set(s);
    const o = t.window_sensors || [];
    this._windowSensors = new Set(o), this._restoreDelayMinutes = t.restore_delay_minutes || 0, console.log("Loaded Config:", {
      name: this._name,
      temp: this._temperatureSensor,
      heaters: this._heaters,
      coolers: this._coolers,
      restore: this._restoreDelayMinutes
    }), await this._fetchCircuits();
    const r = this._circuits.find(
      (h) => h.member_zones.includes(this._uniqueId)
    );
    this._selectedCircuitId = r ? r.id : "", this._loading = !1;
  }
  async _fetchCircuits() {
    try {
      this._circuits = await this.hass.callWS({
        type: "climate_dashboard/circuit/list"
      });
    } catch (e) {
      console.error("Failed to fetch circuits", e);
    }
  }
  _toggleSet(e, t) {
    e.has(t) ? e.delete(t) : e.add(t), this.requestUpdate();
  }
  _getEntityList(e) {
    let t = this.allEntities.filter((i) => e.includes(i.domain));
    return this._filterByArea && this._zoneAreaId && (t = t.filter((i) => i.area_id === this._zoneAreaId)), t;
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
        restore_delay_minutes: Number(this._restoreDelayMinutes),
        circuit_ids: this._selectedCircuitId ? [this._selectedCircuitId] : []
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
    if (this._loading) return n`<div class="card">Loading...</div>`;
    if (this._error) return n`<div class="card">Error: ${this._error}</div>`;
    const e = this._getEntityList(["climate", "switch"]), t = this._getEntityList(["climate"]), i = this._getEntityList(["binary_sensor"]);
    let s = this.allEntities.filter(
      (o) => o.domain === "sensor" && o.device_class === "temperature" || o.domain === "climate"
    );
    return this._filterByArea && this._zoneAreaId && (s = s.filter(
      (o) => o.area_id === this._zoneAreaId
    )), n`
      <div class="card">
        <h2>
          Edit Zone: ${this._name}
          ${this._zoneAreaId ? n`
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
          <label>Heating Circuit</label>
          <div
            style="font-size: 0.8em; color: var(--secondary-text-color); margin-bottom: 4px;"
          >
            Assign this zone to a circuit (e.g., Boiler, Pump) to demand heat.
          </div>
          <select
            .value=${this._selectedCircuitId}
            @change=${(o) => this._selectedCircuitId = o.target.value}
          >
            <option value="">None (Standalone)</option>
            ${this._circuits.map(
      (o) => n`
                <option
                  value="${o.id}"
                  ?selected=${this._selectedCircuitId === o.id}
                >
                  ${o.name}
                </option>
              `
    )}
          </select>
        </div>

        <div class="field">
          <label>Temperature Sensor</label>
          <select
            @change=${(o) => this._temperatureSensor = o.target.value}
          >
            <option value="">Select Sensor</option>
            ${s.map(
      (o) => n`
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
      (o) => n`
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
      (o) => n`
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
            ${i.map(
      (o) => n`
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
Ae.styles = P`
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
let g = Ae;
b([
  y({ attribute: !1 })
], g.prototype, "hass");
b([
  y({ attribute: !1 })
], g.prototype, "zoneId");
b([
  y({ attribute: !1 })
], g.prototype, "allEntities");
b([
  p()
], g.prototype, "_uniqueId");
b([
  p()
], g.prototype, "_name");
b([
  p()
], g.prototype, "_temperatureSensor");
b([
  p()
], g.prototype, "_heaters");
b([
  p()
], g.prototype, "_coolers");
b([
  p()
], g.prototype, "_windowSensors");
b([
  p()
], g.prototype, "_restoreDelayMinutes");
b([
  p()
], g.prototype, "_filterByArea");
b([
  p()
], g.prototype, "_zoneAreaId");
b([
  p()
], g.prototype, "_zoneAreaName");
b([
  p()
], g.prototype, "_circuits");
b([
  p()
], g.prototype, "_selectedCircuitId");
b([
  p()
], g.prototype, "_loading");
b([
  p()
], g.prototype, "_error");
b([
  p()
], g.prototype, "_showDeleteDialog");
customElements.get("zone-editor") || customElements.define("zone-editor", g);
var ft = Object.defineProperty, R = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && ft(e, t, s), s;
};
const vt = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], ke = class ke extends A {
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
          const i = JSON.parse(
            JSON.stringify(t.attributes.schedule)
          );
          this._schedule = i.map((s) => ({
            ...s,
            temp_heat: s.temp_heat ?? 20,
            temp_cool: s.temp_cool ?? 24
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
    this._schedule = this._schedule.filter((t, i) => i !== e);
  }
  _updateBlock(e, t, i) {
    const s = [...this._schedule];
    s[e] = { ...s[e], [t]: i }, this._schedule = s;
  }
  _toggleDay(e, t) {
    const i = this._schedule[e], s = new Set(i.days);
    s.has(t) ? s.delete(t) : s.add(t), this._updateBlock(e, "days", Array.from(s));
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
    return this._loading ? n`<div>Loading...</div>` : n`
      <div class="card">
        <h2>Schedule: ${this._config.name}</h2>
        <div class="block-list">
          ${this._schedule.map(
      (e, t) => n`
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
                      @input=${(i) => this._updateBlock(t, "name", i.target.value)}
                    />
                  </div>
                  <div class="field">
                    <label>Start Time</label>
                    <input
                      type="time"
                      .value=${e.start_time}
                      @input=${(i) => this._updateBlock(t, "start_time", i.target.value)}
                    />
                  </div>
                  ${this._config.heaters.length > 0 ? n`
                        <div class="field">
                          <label>Heat To (°C)</label>
                          <input
                            type="number"
                            step="0.5"
                            .value=${e.temp_heat ?? 20}
                            @input=${(i) => this._updateBlock(
        t,
        "temp_heat",
        parseFloat(i.target.value)
      )}
                          />
                        </div>
                      ` : ""}
                  ${this._config.coolers.length > 0 ? n`
                        <div class="field">
                          <label>Cool To (°C)</label>
                          <input
                            type="number"
                            step="0.5"
                            .value=${e.temp_cool ?? 24}
                            @input=${(i) => this._updateBlock(
        t,
        "temp_cool",
        parseFloat(i.target.value)
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
        (i) => n`
                          <button
                            class="day-btn ${e.days.includes(i) ? "active" : ""}"
                            @click=${() => this._toggleDay(t, i)}
                          >
                            ${i.toUpperCase()}
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
ke.styles = P`
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
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
    @media (max-width: 600px) {
      .days-selector {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    .day-btn {
      padding: 6px 4px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8em;
      background: transparent;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
let S = ke;
R([
  y({ attribute: !1 })
], S.prototype, "hass");
R([
  y({ attribute: !1 })
], S.prototype, "zoneId");
R([
  p()
], S.prototype, "_schedule");
R([
  p()
], S.prototype, "_loading");
R([
  p()
], S.prototype, "_uniqueId");
R([
  p()
], S.prototype, "_config");
customElements.get("schedule-editor") || customElements.define("schedule-editor", S);
var yt = Object.defineProperty, B = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && yt(e, t, s), s;
};
const Ce = class Ce extends A {
  constructor() {
    super(...arguments), this._view = "zones", this._editingZoneId = null, this._unmanagedCount = 0, this._isAwayMode = !1, this._handleVisibilityChange = () => {
      var e;
      if (document.visibilityState === "visible") {
        const t = window.location.pathname.includes("climate-dashboard");
        if (!this.isConnected && t) {
          console.warn(
            "[ClimateDashboard] Zombie state detected (Tab visible but component detached). Forcing reload."
          ), window.location.reload();
          return;
        }
        if (this.isConnected) {
          this.requestUpdate();
          const i = (e = this.shadowRoot) == null ? void 0 : e.querySelector(
            this._view === "zones" ? "zones-view" : this._view === "timeline" ? "timeline-view" : this._view === "setup" ? "setup-view" : this._view === "editor" ? "zone-editor" : this._view === "schedule" ? "schedule-editor" : "unknown"
          );
          i && i.requestUpdate();
        }
      }
    };
  }
  // ... (omitted) ...
  connectedCallback() {
    super.connectedCallback(), document.addEventListener("visibilitychange", this._handleVisibilityChange);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  updated(e) {
    super.updated(e);
  }
  firstUpdated() {
    this._scanForBadge(), this._fetchGlobalSettings();
  }
  async _fetchGlobalSettings() {
    if (this.hass)
      try {
        const e = await this.hass.callWS({
          type: "climate_dashboard/settings/get"
        });
        this._isAwayMode = e.is_away_mode_on;
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
  }
  async _scanForBadge() {
    if (this.hass)
      try {
        const t = (await this.hass.callWS({
          type: "climate_dashboard/scan"
        })).filter(
          (i) => ["climate", "switch"].includes(i.domain)
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
      var i, s, o, r, l, c;
      return {
        entity_id: t.entity_id,
        domain: t.entity_id.split(".")[0],
        name: t.attributes.friendly_name || t.entity_id,
        device_class: t.attributes.device_class,
        area_id: ((s = (i = this.hass.entities) == null ? void 0 : i[t.entity_id]) == null ? void 0 : s.area_id) || ((c = (l = this.hass.devices) == null ? void 0 : l[(r = (o = this.hass.entities) == null ? void 0 : o[t.entity_id]) == null ? void 0 : r.device_id]) == null ? void 0 : c.area_id)
      };
    });
  }
  render() {
    try {
      return this.hass ? n`
        <div class="header">
          ${this._view !== "zones" ? n`
                <button
                  class="icon-btn"
                  @click=${() => {
        this._view === "schedule" ? (this._view = "timeline", this._editingZoneId = null) : (this._view = "zones", this._editingZoneId = null);
      }}
                >
                  <ha-icon icon="mdi:arrow-left"></ha-icon>
                </button>
              ` : n`
                <ha-menu-button
                  .hass=${this.hass}
                  .narrow=${this.narrow}
                ></ha-menu-button>
              `}

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
              ${this._unmanagedCount > 0 ? n`<span class="badge">${this._unmanagedCount}</span>` : ""}
            </button>
          </div>
        </div>

        <div class="content">
          <!-- Global Mode Toggles (Only show in main views) -->
          ${this._view === "zones" || this._view === "timeline" ? n`
                <div class="center-toggle">
                  <button
                    class="toggle-option home ${this._isAwayMode ? "" : "active"}"
                    @click=${() => this._setAwayMode(!1)}
                  >
                    <ha-icon icon="mdi:home"></ha-icon>
                    <span>Home</span>
                  </button>
                  <button
                    class="toggle-option away ${this._isAwayMode ? "active" : ""}"
                    @click=${() => this._setAwayMode(!0)}
                  >
                    <ha-icon icon="mdi:walk"></ha-icon>
                    <span>Away</span>
                  </button>
                </div>
              ` : ""}
          ${this._view === "zones" ? n`<zones-view
                .hass=${this.hass}
                .isAwayMode=${this._isAwayMode}
                @zone-settings=${(e) => {
        this._editingZoneId = e.detail.entityId, this._view = "editor";
      }}
                @zone-details=${(e) => {
        this._editingZoneId = e.detail.entityId, this._view = "timeline";
      }}
              ></zones-view>` : ""}
          ${this._view === "setup" ? n`<setup-view .hass=${this.hass}></setup-view>` : ""}
          ${this._view === "timeline" ? n` <timeline-view
                .hass=${this.hass}
                .focusZoneId=${this._editingZoneId}
                @schedule-selected=${(e) => {
        this._editingZoneId = e.detail.entityId, this._view = "schedule";
      }}
              ></timeline-view>` : ""}
          ${this._view === "editor" && this._editingZoneId ? n`
                <zone-editor
                  .hass=${this.hass}
                  .zoneId=${this._editingZoneId}
                  .allEntities=${this._getEditorCandidates()}
                  @close=${() => {
        this._view = "zones", this._editingZoneId = null;
      }}
                ></zone-editor>
              ` : ""}
          ${this._view === "schedule" && this._editingZoneId ? n`
                <schedule-editor
                  .hass=${this.hass}
                  .zoneId=${this._editingZoneId}
                  @close=${() => {
        this._view = "timeline", this._editingZoneId = null;
      }}
                ></schedule-editor>
              ` : ""}
        </div>
      ` : n`<div class="loading">Loading Home Assistant...</div>`;
    } catch (e) {
      return console.error("Critical Error rendering Climate Dashboard:", e), n`
        <div
          style="padding: 24px; text-align: center; color: var(--error-color);"
        >
          <h2>Dashboard Error</h2>
          <p>Something went wrong rendering the dashboard.</p>
          <pre style="text-align: left; background: #eee; padding: 16px;">
${e instanceof Error ? e.message : String(e)}</pre
          >
          <button
            @click=${() => window.location.reload()}
            style="margin-top: 16px; padding: 8px 16px;"
          >
            Reload Page
          </button>
        </div>
      `;
    }
  }
  async _setAwayMode(e) {
    if (this._isAwayMode === e) return;
    const t = this._isAwayMode;
    this._isAwayMode = e;
    try {
      await this.hass.callWS({
        type: "climate_dashboard/settings/update",
        is_away_mode_on: e
      });
    } catch (i) {
      this._isAwayMode = t, console.error("Failed to set Away Mode", i);
    }
  }
};
Ce.styles = P`
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
      margin-left: 16px;
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
    .center-toggle {
      display: flex;
      background: var(--card-background-color, white);
      border-radius: 24px;
      padding: 4px;
      gap: 4px;
      margin: 16px auto 0 auto;
      width: fit-content;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .toggle-option {
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color, #757575);
      transition: all 0.2s;
      border: none;
      background: none;
      line-height: normal;
    }
    .toggle-option.active {
      background: var(--primary-color, #03a9f4);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    /* Specific Colors for Active States - actually, let's just use primary color for active bg */
    .toggle-option.home.active {
      background: var(--primary-color, #03a9f4);
    }
    .toggle-option.away.active {
      background: var(--warning-color, #ff9800);
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
let C = Ce;
B([
  y({ attribute: !1 })
], C.prototype, "hass");
B([
  y({ attribute: !1 })
], C.prototype, "narrow");
B([
  y({ attribute: !1 })
], C.prototype, "panel");
B([
  p()
], C.prototype, "_view");
B([
  p()
], C.prototype, "_editingZoneId");
B([
  p()
], C.prototype, "_unmanagedCount");
B([
  p()
], C.prototype, "_isAwayMode");
customElements.get("climate-dashboard") || customElements.define("climate-dashboard", C);
console.info(
  "%c CLIMATE-DASHBOARD %c 0.0.1 ",
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;"
);
