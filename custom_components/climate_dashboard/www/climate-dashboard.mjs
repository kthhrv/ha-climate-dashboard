/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oe = globalThis, ge = oe.ShadowRoot && (oe.ShadyCSS === void 0 || oe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, fe = Symbol(), Ee = /* @__PURE__ */ new WeakMap();
let Ue = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== fe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (ge && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = Ee.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Ee.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Fe = (a) => new Ue(typeof a == "string" ? a : a + "", void 0, fe), H = (a, ...e) => {
  const t = a.length === 1 ? a[0] : e.reduce((i, s, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + a[r + 1], a[0]);
  return new Ue(t, a, fe);
}, Ge = (a, e) => {
  if (ge) a.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), s = oe.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = t.cssText, a.appendChild(i);
  }
}, Ie = ge ? (a) => a : (a) => a instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return Fe(t);
})(a) : a;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ve, defineProperty: Je, getOwnPropertyDescriptor: Ke, getOwnPropertyNames: Xe, getOwnPropertySymbols: Ye, getPrototypeOf: Qe } = Object, N = globalThis, ze = N.trustedTypes, et = ze ? ze.emptyScript : "", pe = N.reactiveElementPolyfillSupport, J = (a, e) => a, re = { toAttribute(a, e) {
  switch (e) {
    case Boolean:
      a = a ? et : null;
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
} }, ve = (a, e) => !Ve(a, e), De = { attribute: !0, type: String, converter: re, reflect: !1, useDefault: !1, hasChanged: ve };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), N.litPropertyMetadata ?? (N.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let L = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = De) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(e, i, t);
      s !== void 0 && Je(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: s, set: r } = Ke(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: s, set(o) {
      const c = s == null ? void 0 : s.call(this);
      r == null || r.call(this, o), this.requestUpdate(e, c, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? De;
  }
  static _$Ei() {
    if (this.hasOwnProperty(J("elementProperties"))) return;
    const e = Qe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(J("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(J("properties"))) {
      const t = this.properties, i = [...Xe(t), ...Ye(t)];
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
      for (const s of i) t.unshift(Ie(s));
    } else e !== void 0 && t.push(Ie(e));
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
    return Ge(e, this.constructor.elementStyles), e;
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
    var r;
    const i = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, i);
    if (s !== void 0 && i.reflect === !0) {
      const o = (((r = i.converter) == null ? void 0 : r.toAttribute) !== void 0 ? i.converter : re).toAttribute(t, i.type);
      this._$Em = e, o == null ? this.removeAttribute(s) : this.setAttribute(s, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var r, o;
    const i = this.constructor, s = i._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const c = i.getPropertyOptions(s), l = typeof c.converter == "function" ? { fromAttribute: c.converter } : ((r = c.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? c.converter : re;
      this._$Em = s;
      const h = l.fromAttribute(t, c.type);
      this[s] = h ?? ((o = this._$Ej) == null ? void 0 : o.get(s)) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, t, i) {
    var s;
    if (e !== void 0) {
      const r = this.constructor, o = this[e];
      if (i ?? (i = r.getPropertyOptions(e)), !((i.hasChanged ?? ve)(o, t) || i.useDefault && i.reflect && o === ((s = this._$Ej) == null ? void 0 : s.get(e)) && !this.hasAttribute(r._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: s, wrapped: r }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), r !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), s === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, o] of s) {
        const { wrapped: c } = o, l = this[r];
        c !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, o, l);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (i = this._$EO) == null || i.forEach((s) => {
        var r;
        return (r = s.hostUpdate) == null ? void 0 : r.call(s);
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
L.elementStyles = [], L.shadowRootOptions = { mode: "open" }, L[J("elementProperties")] = /* @__PURE__ */ new Map(), L[J("finalized")] = /* @__PURE__ */ new Map(), pe == null || pe({ ReactiveElement: L }), (N.reactiveElementVersions ?? (N.reactiveElementVersions = [])).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis, ae = K.trustedTypes, Ne = ae ? ae.createPolicy("lit-html", { createHTML: (a) => a }) : void 0, je = "$lit$", D = `lit$${Math.random().toFixed(9).slice(2)}$`, Le = "?" + D, tt = `<${Le}>`, B = document, X = () => B.createComment(""), Y = (a) => a === null || typeof a != "object" && typeof a != "function", ye = Array.isArray, it = (a) => ye(a) || typeof (a == null ? void 0 : a[Symbol.iterator]) == "function", ue = `[ 	
\f\r]`, V = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Te = /-->/g, Me = />/g, M = RegExp(`>|${ue}(?:([^\\s"'>=/]+)(${ue}*=${ue}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Oe = /'/g, Pe = /"/g, Ze = /^(?:script|style|textarea|title)$/i, st = (a) => (e, ...t) => ({ _$litType$: a, strings: e, values: t }), n = st(1), Z = Symbol.for("lit-noChange"), f = Symbol.for("lit-nothing"), Be = /* @__PURE__ */ new WeakMap(), O = B.createTreeWalker(B, 129);
function Re(a, e) {
  if (!ye(a) || !a.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ne !== void 0 ? Ne.createHTML(e) : e;
}
const ot = (a, e) => {
  const t = a.length - 1, i = [];
  let s, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = V;
  for (let c = 0; c < t; c++) {
    const l = a[c];
    let h, u, p = -1, _ = 0;
    for (; _ < l.length && (o.lastIndex = _, u = o.exec(l), u !== null); ) _ = o.lastIndex, o === V ? u[1] === "!--" ? o = Te : u[1] !== void 0 ? o = Me : u[2] !== void 0 ? (Ze.test(u[2]) && (s = RegExp("</" + u[2], "g")), o = M) : u[3] !== void 0 && (o = M) : o === M ? u[0] === ">" ? (o = s ?? V, p = -1) : u[1] === void 0 ? p = -2 : (p = o.lastIndex - u[2].length, h = u[1], o = u[3] === void 0 ? M : u[3] === '"' ? Pe : Oe) : o === Pe || o === Oe ? o = M : o === Te || o === Me ? o = V : (o = M, s = void 0);
    const b = o === M && a[c + 1].startsWith("/>") ? " " : "";
    r += o === V ? l + tt : p >= 0 ? (i.push(h), l.slice(0, p) + je + l.slice(p) + D + b) : l + D + (p === -2 ? c : b);
  }
  return [Re(a, r + (a[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Q {
  constructor({ strings: e, _$litType$: t }, i) {
    let s;
    this.parts = [];
    let r = 0, o = 0;
    const c = e.length - 1, l = this.parts, [h, u] = ot(e, t);
    if (this.el = Q.createElement(h, i), O.currentNode = this.el.content, t === 2 || t === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (s = O.nextNode()) !== null && l.length < c; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const p of s.getAttributeNames()) if (p.endsWith(je)) {
          const _ = u[o++], b = s.getAttribute(p).split(D), w = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: r, name: w[2], strings: b, ctor: w[1] === "." ? at : w[1] === "?" ? nt : w[1] === "@" ? lt : le }), s.removeAttribute(p);
        } else p.startsWith(D) && (l.push({ type: 6, index: r }), s.removeAttribute(p));
        if (Ze.test(s.tagName)) {
          const p = s.textContent.split(D), _ = p.length - 1;
          if (_ > 0) {
            s.textContent = ae ? ae.emptyScript : "";
            for (let b = 0; b < _; b++) s.append(p[b], X()), O.nextNode(), l.push({ type: 2, index: ++r });
            s.append(p[_], X());
          }
        }
      } else if (s.nodeType === 8) if (s.data === Le) l.push({ type: 2, index: r });
      else {
        let p = -1;
        for (; (p = s.data.indexOf(D, p + 1)) !== -1; ) l.push({ type: 7, index: r }), p += D.length - 1;
      }
      r++;
    }
  }
  static createElement(e, t) {
    const i = B.createElement("template");
    return i.innerHTML = e, i;
  }
}
function R(a, e, t = a, i) {
  var o, c;
  if (e === Z) return e;
  let s = i !== void 0 ? (o = t._$Co) == null ? void 0 : o[i] : t._$Cl;
  const r = Y(e) ? void 0 : e._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== r && ((c = s == null ? void 0 : s._$AO) == null || c.call(s, !1), r === void 0 ? s = void 0 : (s = new r(a), s._$AT(a, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = s : t._$Cl = s), s !== void 0 && (e = R(a, s._$AS(a, e.values), s, i)), e;
}
class rt {
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
    const { el: { content: t }, parts: i } = this._$AD, s = ((e == null ? void 0 : e.creationScope) ?? B).importNode(t, !0);
    O.currentNode = s;
    let r = O.nextNode(), o = 0, c = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let h;
        l.type === 2 ? h = new te(r, r.nextSibling, this, e) : l.type === 1 ? h = new l.ctor(r, l.name, l.strings, this, e) : l.type === 6 && (h = new ct(r, this, e)), this._$AV.push(h), l = i[++c];
      }
      o !== (l == null ? void 0 : l.index) && (r = O.nextNode(), o++);
    }
    return O.currentNode = B, s;
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
    e = R(this, e, t), Y(e) ? e === f || e == null || e === "" ? (this._$AH !== f && this._$AR(), this._$AH = f) : e !== this._$AH && e !== Z && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : it(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== f && Y(this._$AH) ? this._$AA.nextSibling.data = e : this.T(B.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var r;
    const { values: t, _$litType$: i } = e, s = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Q.createElement(Re(i.h, i.h[0]), this.options)), i);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === s) this._$AH.p(t);
    else {
      const o = new rt(s, this), c = o.u(this.options);
      o.p(t), this.T(c), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = Be.get(e.strings);
    return t === void 0 && Be.set(e.strings, t = new Q(e)), t;
  }
  k(e) {
    ye(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, s = 0;
    for (const r of e) s === t.length ? t.push(i = new te(this.O(X()), this.O(X()), this, this.options)) : i = t[s], i._$AI(r), s++;
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
class le {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, s, r) {
    this.type = 1, this._$AH = f, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = f;
  }
  _$AI(e, t = this, i, s) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) e = R(this, e, t, 0), o = !Y(e) || e !== this._$AH && e !== Z, o && (this._$AH = e);
    else {
      const c = e;
      let l, h;
      for (e = r[0], l = 0; l < r.length - 1; l++) h = R(this, c[i + l], t, l), h === Z && (h = this._$AH[l]), o || (o = !Y(h) || h !== this._$AH[l]), h === f ? e = f : e !== f && (e += (h ?? "") + r[l + 1]), this._$AH[l] = h;
    }
    o && !s && this.j(e);
  }
  j(e) {
    e === f ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class at extends le {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === f ? void 0 : e;
  }
}
class nt extends le {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== f);
  }
}
class lt extends le {
  constructor(e, t, i, s, r) {
    super(e, t, i, s, r), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = R(this, e, t, 0) ?? f) === Z) return;
    const i = this._$AH, s = e === f && i !== f || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, r = e !== f && (i === f || s);
    s && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class ct {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    R(this, e);
  }
}
const _e = K.litHtmlPolyfillSupport;
_e == null || _e(Q, te), (K.litHtmlVersions ?? (K.litHtmlVersions = [])).push("3.3.1");
const dt = (a, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let s = i._$litPart$;
  if (s === void 0) {
    const r = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = s = new te(e.insertBefore(X(), r), r, void 0, t ?? {});
  }
  return s._$AI(a), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const P = globalThis;
class A extends L {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = dt(t, this.renderRoot, this.renderOptions);
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
    return Z;
  }
}
var He;
A._$litElement$ = !0, A.finalized = !0, (He = P.litElementHydrateSupport) == null || He.call(P, { LitElement: A });
const me = P.litElementPolyfillSupport;
me == null || me({ LitElement: A });
(P.litElementVersions ?? (P.litElementVersions = [])).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ht = { attribute: !0, type: String, converter: re, reflect: !1, hasChanged: ve }, pt = (a = ht, e, t) => {
  const { kind: i, metadata: s } = t;
  let r = globalThis.litPropertyMetadata.get(s);
  if (r === void 0 && globalThis.litPropertyMetadata.set(s, r = /* @__PURE__ */ new Map()), i === "setter" && ((a = Object.create(a)).wrapped = !0), r.set(t.name, a), i === "accessor") {
    const { name: o } = t;
    return { set(c) {
      const l = e.get.call(this);
      e.set.call(this, c), this.requestUpdate(o, l, a);
    }, init(c) {
      return c !== void 0 && this.C(o, void 0, a, c), c;
    } };
  }
  if (i === "setter") {
    const { name: o } = t;
    return function(c) {
      const l = this[o];
      e.call(this, c), this.requestUpdate(o, l, a);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function v(a) {
  return (e, t) => typeof t == "object" ? pt(a, e, t) : ((i, s, r) => {
    const o = s.hasOwnProperty(r);
    return s.constructor.createProperty(r, i), o ? Object.getOwnPropertyDescriptor(s, r) : void 0;
  })(a, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function d(a) {
  return v({ ...a, state: !0, attribute: !1 });
}
var ut = Object.defineProperty, x = (a, e, t, i) => {
  for (var s = void 0, r = a.length - 1, o; r >= 0; r--)
    (o = a[r]) && (s = o(e, t, s) || s);
  return s && ut(e, t, s), s;
};
const xe = class xe extends A {
  constructor() {
    super(...arguments), this.open = !1, this.entities = [], this.preselected = null, this._name = "", this._temperatureSensor = "", this._heaters = /* @__PURE__ */ new Set(), this._thermostats = /* @__PURE__ */ new Set(), this._coolers = /* @__PURE__ */ new Set(), this._windowSensors = /* @__PURE__ */ new Set(), this._roomType = "generic", this._filterByArea = !0, this._targetAreaId = null, this._targetAreaName = null, this._circuits = [], this._selectedCircuit = "";
  }
  updated(e) {
    if (e.has("open") && this.open && this.preselected) {
      const t = this.entities.find((i) => i.entity_id === this.preselected);
      if (t) {
        this._name = t.area_name || t.name || t.entity_id.split(".")[1], this._heaters.clear(), this._thermostats.clear(), this._coolers.clear(), this._windowSensors.clear(), t.area_id ? (this._targetAreaId = t.area_id, this._targetAreaName = t.area_name || "Zone Area", this._filterByArea = !0) : (this._targetAreaId = null, this._targetAreaName = null, this._filterByArea = !1);
        const i = this._name.toLowerCase();
        i.includes("bedroom") || i.includes("sleeping") ? this._roomType = "bedroom" : i.includes("living") || i.includes("lounge") ? this._roomType = "living_room" : i.includes("office") || i.includes("study") ? this._roomType = "office" : this._roomType = "generic", t.domain === "climate" ? (this._heaters.add(t.entity_id), this._temperatureSensor = t.entity_id) : t.domain === "switch" && this._heaters.add(t.entity_id), this.hass.callWS({ type: "climate_dashboard/circuit/list" }).then((s) => {
          this._circuits = s, this._selectedCircuit && !s.find((r) => r.id === this._selectedCircuit) && (this._selectedCircuit = "");
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
      (t) => t.domain === "sensor" && t.device_class === "temperature" || t.domain === "climate" || t.domain === "input_number"
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
      thermostats: Array.from(this._thermostats),
      coolers: Array.from(this._coolers),
      window_sensors: Array.from(this._windowSensors),
      room_type: this._roomType,
      circuit_ids: this._selectedCircuit ? [this._selectedCircuit] : []
    }), this.dispatchEvent(new CustomEvent("close"));
  }
  render() {
    const e = this._getEntityList(["climate", "switch"]), t = this._getEntityList(["climate"]), i = this._getEntityList(["climate"]), s = this._getEntityList(["binary_sensor"]), r = this._getSensors();
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
            ${r.map(
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
          <label>Thermostats (Wall Dials)</label>
          <div class="checkbox-list">
            ${t.map(
      (o) => n`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._thermostats.has(o.entity_id)}
                    @change=${() => this._toggleSet(this._thermostats, o.entity_id)}
                  />
                  <span>${o.name || o.entity_id}</span>
                </div>
              `
    )}
            ${t.length === 0 ? n`<div style="color:var(--secondary-text-color)">
                  No thermostats found in this area
                </div>` : ""}
          </div>
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
            ${i.map(
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
            ${i.length === 0 ? n`<div style="color:var(--secondary-text-color)">
                  No coolers found in this area
                </div>` : ""}
          </div>
        </div>

        <div class="field">
          <label>Window Sensors</label>
          <div class="checkbox-list">
            ${s.map(
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
            ${s.length === 0 ? n`<div style="color:var(--secondary-text-color)">
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
xe.styles = H`
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
let g = xe;
x([
  v({ attribute: !1 })
], g.prototype, "hass");
x([
  v({ type: Boolean, reflect: !0 })
], g.prototype, "open");
x([
  v({ attribute: !1 })
], g.prototype, "entities");
x([
  v({ attribute: !1 })
], g.prototype, "preselected");
x([
  d()
], g.prototype, "_name");
x([
  d()
], g.prototype, "_temperatureSensor");
x([
  d()
], g.prototype, "_heaters");
x([
  d()
], g.prototype, "_thermostats");
x([
  d()
], g.prototype, "_coolers");
x([
  d()
], g.prototype, "_windowSensors");
x([
  d()
], g.prototype, "_roomType");
x([
  d()
], g.prototype, "_filterByArea");
x([
  d()
], g.prototype, "_targetAreaId");
x([
  d()
], g.prototype, "_targetAreaName");
x([
  d()
], g.prototype, "_circuits");
x([
  d()
], g.prototype, "_selectedCircuit");
customElements.get("adopt-dialog") || customElements.define("adopt-dialog", g);
var _t = Object.defineProperty, k = (a, e, t, i) => {
  for (var s = void 0, r = a.length - 1, o; r >= 0; r--)
    (o = a[r]) && (s = o(e, t, s) || s);
  return s && _t(e, t, s), s;
};
const $e = class $e extends A {
  constructor() {
    super(...arguments), this._devices = [], this._loading = !1, this._settings = {
      default_override_type: "disabled",
      default_timer_minutes: 60,
      window_open_delay_seconds: 30,
      home_away_entity_id: null,
      away_delay_minutes: 10,
      away_temperature: 16,
      away_temperature_cool: 30,
      is_away_mode_on: !1
    }, this._circuits = [], this._circuitDialogOpen = !1, this._editingCircuit = null, this._tempCircuitName = "", this._tempCircuitHeaters = [], this._dialogOpen = !1, this._selectedEntity = null, this._filterText = "";
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
            <option value="disabled">Disabled (Manual Not Respected)</option>
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
        <input
          type="text"
          class="search-input"
          placeholder="Filter devices by name, id or area..."
          .value=${this._filterText}
          @input=${(e) => this._filterText = e.target.value}
        />
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
    const e = this._filterText.toLowerCase(), t = this._devices.filter((i) => {
      const s = ["climate", "switch"].includes(i.domain), r = !this._filterText || i.name.toLowerCase().includes(e) || i.entity_id.toLowerCase().includes(e) || i.area_name && i.area_name.toLowerCase().includes(e);
      return s && r;
    });
    return t.length === 0 ? n`<div class="empty">No unmanaged actuators found.</div>` : n`
      <div class="list">
        ${t.map(
      (i) => n`
            <div class="item">
              <div class="item-info">
                <span class="icon">
                  <ha-icon
                    icon="${i.domain === "switch" ? "mdi:power-socket" : "mdi:thermostat"}"
                  ></ha-icon>
                </span>
                <div>
                  <div>${i.name || i.entity_id}</div>
                  <div
                    style="font-size: 0.8em; color: var(--secondary-text-color); display: flex; align-items: center; margin-top: 2px;"
                  >
                    ${i.area_name ? n`<span class="area-badge"
                          >${i.area_name}</span
                        >` : ""}
                    ${i.entity_id} • ${i.state}
                  </div>
                </div>
              </div>
              <button
                class="adopt-btn"
                @click=${() => this._openDialog(i.entity_id)}
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
$e.styles = H`
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
    .search-input {
      width: 100%;
      margin-bottom: 12px;
      padding: 10px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      box-sizing: border-box;
    }
  `;
let $ = $e;
k([
  v({ attribute: !1 })
], $.prototype, "hass");
k([
  d()
], $.prototype, "_devices");
k([
  d()
], $.prototype, "_loading");
k([
  d()
], $.prototype, "_settings");
k([
  d()
], $.prototype, "_circuits");
k([
  d()
], $.prototype, "_circuitDialogOpen");
k([
  d()
], $.prototype, "_editingCircuit");
k([
  d()
], $.prototype, "_tempCircuitName");
k([
  d()
], $.prototype, "_tempCircuitHeaters");
k([
  d()
], $.prototype, "_dialogOpen");
k([
  d()
], $.prototype, "_selectedEntity");
k([
  d()
], $.prototype, "_filterText");
customElements.get("setup-view") || customElements.define("setup-view", $);
class ne {
  /**
   * Groups zones by Floor -> Area.
   * Logic: Entity -> Area -> Floor.
   */
  static getGroupedZones(e, t) {
    if (!e) return [];
    let i = Object.values(e.states).filter(
      (l) => l.attributes.is_climate_dashboard_zone
    );
    if (t)
      return i = i.filter((l) => l.entity_id === t), [{ floorName: null, floorIcon: null, zones: i }];
    if (!e.floors || Object.keys(e.floors).length === 0)
      return i.length === 0 ? [] : [{ floorName: null, floorIcon: null, zones: i }];
    const s = {}, r = [];
    i.forEach((l) => {
      var b, w, C;
      const h = (b = e.entities) == null ? void 0 : b[l.entity_id], u = h == null ? void 0 : h.area_id, p = u ? (w = e.areas) == null ? void 0 : w[u] : null, _ = p == null ? void 0 : p.floor_id;
      if (_ && ((C = e.floors) != null && C[_])) {
        const E = e.floors[_];
        s[_] || (s[_] = {
          floorName: E.name,
          floorIcon: E.icon,
          level: E.level,
          zones: []
        }), s[_].zones.push(l);
      } else
        r.push(l);
    });
    const c = Object.values(s).sort((l, h) => l.level !== null && h.level !== null ? h.level - l.level : l.floorName.localeCompare(h.floorName)).map((l) => ({
      floorName: l.floorName,
      floorIcon: l.floorIcon,
      zones: l.zones
    }));
    return r.length > 0 && c.push({
      floorName: "Other Devices",
      floorIcon: "mdi:devices",
      zones: r
    }), c;
  }
  /**
   * Processes schedule blocks for visualization.
   * Handles "Carry Over" logic (looking back at previous days to fill 00:00 gap).
   */
  static getTimelineBlocks(e, t) {
    const i = e.attributes.schedule || [], s = (e.attributes.heaters || []).length > 0, r = (e.attributes.coolers || []).length > 0;
    let o = "off";
    s && r ? o = "auto" : s ? o = "heat" : r && (o = "cool");
    const c = i.filter(
      (h) => h.days.includes(t)
    );
    if (c.sort(
      (h, u) => h.start_time.localeCompare(u.start_time)
    ), (c.length > 0 ? c[0].start_time : "24:00") > "00:00") {
      const h = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], u = h.indexOf(t);
      let p = null;
      for (let _ = 1; _ <= 7; _++) {
        const b = (u - _ + 7) % 7, w = h[b], C = i.filter(
          (E) => E.days.includes(w)
        );
        if (C.length > 0) {
          C.sort(
            (E, ce) => E.start_time.localeCompare(ce.start_time)
          ), p = C[C.length - 1];
          break;
        }
      }
      if (p) {
        const _ = {
          ...p,
          start_time: "00:00",
          name: `Carry-over (${p.name})`
        };
        c.unshift(_);
      }
    }
    return c.map((h, u) => {
      const [p, _] = h.start_time.split(":").map(Number), b = p * 60 + _;
      let w = 1440;
      if (u < c.length - 1) {
        const T = c[u + 1], [de, he] = T.start_time.split(":").map(Number);
        w = de * 60 + he;
      }
      const C = w - b, E = b / 1440 * 100, ce = C / 1440 * 100;
      let j = "";
      const F = h.temp_heat ?? 20, ie = h.temp_cool ?? 24, z = 16, se = 24;
      let G = 1;
      if (o === "heat") {
        j = `${F}°`;
        const T = (F - z) / (se - z);
        G = 0.4 + 0.6 * Math.min(Math.max(T, 0), 1);
      } else if (o === "cool") {
        j = `${ie}°`;
        const T = (ie - z) / (se - z);
        G = 0.4 + 0.6 * Math.min(Math.max(T, 0), 1);
      } else if (o === "auto") {
        j = `${F}-${ie}°`;
        const T = (F - z) / (se - z), de = 0.4 + 0.6 * Math.min(Math.max(T, 0), 1), he = (ie - z) / (se - z), We = 0.4 + 0.6 * Math.min(Math.max(he, 0), 1);
        G = Math.max(de, We);
      } else
        j = `${F}°`, G = 0.5;
      return {
        left: E,
        width: ce,
        colorClass: `mode-${o}`,
        opacity: G,
        label: j,
        tooltip: `${h.name}: ${h.start_time} (${j})`
      };
    });
  }
  /**
   * Generates a rich status object for the Zone List.
   */
  static getZoneStatus(e, t) {
    const i = e.attributes;
    if (i.safety_mode)
      return {
        icon: "mdi:alert-circle",
        color: "var(--error-color, #f44336)",
        text: "Safety Mode (Sensor Lost)",
        subtext: "Heating to 5°C"
      };
    if (i.using_fallback_sensor)
      return {
        icon: "mdi:thermometer-alert",
        color: "var(--warning-color, #ff9800)",
        text: "Sensor Fallback",
        subtext: `Using ${i.using_fallback_sensor}`
      };
    if (i.open_window_sensor)
      return {
        icon: "mdi:window-open-variant",
        color: "var(--warning-color, #ff9800)",
        text: `Window Open (${i.open_window_sensor})`,
        subtext: "Heating Paused"
      };
    if (t)
      return {
        icon: "mdi:walk",
        color: "var(--warning-color, #ff9800)",
        text: "Away Mode Active",
        subtext: "Global Override"
      };
    if (i.override_end)
      return {
        icon: "mdi:timer-sand",
        color: "var(--primary-color, #03a9f4)",
        text: "Temporary Hold",
        subtext: `Until ${new Date(i.override_end).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })}`
      };
    if (i.next_scheduled_change) {
      const s = new Date(i.next_scheduled_change).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      ), r = (i.heaters || []).length > 0, o = (i.coolers || []).length > 0;
      let c;
      return r && o && i.next_scheduled_temp_heat && i.next_scheduled_temp_cool ? c = n`<span
            style="color: var(--deep-orange-color, #ff5722)"
            >${i.next_scheduled_temp_heat}</span
          >-<span style="color: var(--blue-color, #2196f3)"
            >${i.next_scheduled_temp_cool}</span
          >°` : o && i.next_scheduled_temp_cool ? c = n`<span style="color: var(--blue-color, #2196f3)"
          >${i.next_scheduled_temp_cool}°</span
        >` : r && i.next_scheduled_temp_heat ? c = n`<span
          style="color: var(--deep-orange-color, #ff5722)"
          >${i.next_scheduled_temp_heat}°</span
        >` : c = n`--°`, {
        icon: "mdi:calendar-clock",
        color: "var(--secondary-text-color)",
        text: "Following Schedule",
        subtext: n`${c} at ${s}`
      };
    }
    return {
      icon: "mdi:help-circle",
      color: "var(--disabled-text-color)",
      text: "Unknown State",
      subtext: ""
    };
  }
}
var mt = Object.defineProperty, be = (a, e, t, i) => {
  for (var s = void 0, r = a.length - 1, o; r >= 0; r--)
    (o = a[r]) && (s = o(e, t, s) || s);
  return s && mt(e, t, s), s;
};
const we = class we extends A {
  constructor() {
    super(...arguments), this._selectedDay = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
  }
  render() {
    try {
      if (!this.hass) return n``;
      const e = ne.getGroupedZones(
        this.hass,
        this.focusZoneId
      ), t = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], i = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
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
        (r) => this._renderZoneRow(r, this._selectedDay)
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
    return ne.getTimelineBlocks(e, t).map((s) => n`
        <div
          class="schedule-block ${s.colorClass}"
          style="left: ${s.left}%; width: ${s.width}%; --block-opacity: ${s.opacity.toFixed(
      2
    )};"
          title="${s.tooltip}"
        >
          ${s.label}
        </div>
      `);
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
we.styles = H`
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
let q = we;
be([
  v({ attribute: !1 })
], q.prototype, "hass");
be([
  v()
], q.prototype, "focusZoneId");
be([
  d()
], q.prototype, "_selectedDay");
customElements.get("timeline-view") || customElements.define("timeline-view", q);
var gt = Object.defineProperty, qe = (a, e, t, i) => {
  for (var s = void 0, r = a.length - 1, o; r >= 0; r--)
    (o = a[r]) && (s = o(e, t, s) || s);
  return s && gt(e, t, s), s;
};
const ke = class ke extends A {
  constructor() {
    super(...arguments), this.isAwayMode = !1;
  }
  render() {
    try {
      const e = ne.getGroupedZones(this.hass);
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
  _renderZoneCard(e) {
    const t = e.attributes.hvac_action, i = e.attributes.current_temperature, s = ne.getZoneStatus(e, this.isAwayMode);
    let r = s.icon, o = s.color;
    return (s.text === "Following Schedule" || s.text === "Unknown State") && (t === "heating" ? (r = "mdi:fire", o = "var(--deep-orange-color, #ff5722)") : t === "cooling" ? (r = "mdi:snowflake", o = "var(--blue-color, #2196f3)") : e.state === "heat" ? (r = "mdi:fire", o = "var(--primary-text-color)") : e.state === "cool" ? (r = "mdi:snowflake", o = "var(--primary-text-color)") : e.state === "off" && (r = "mdi:power-off", o = "var(--disabled-text-color)")), n`
      <div class="card" @click=${() => this._openDetails(e.entity_id)}>
        <button
          class="settings-btn"
          @click=${(c) => this._openSettings(c, e.entity_id)}
        >
          <ha-icon icon="mdi:cog"></ha-icon>
        </button>

        <div class="icon" style="color: ${o || "inherit"}">
          <ha-icon icon="${r}"></ha-icon>
        </div>
        <div class="name">
          ${e.attributes.friendly_name || e.entity_id}
        </div>
        <div class="temp">
          ${i != null ? `${i}°` : "--"}
        </div>

        <!-- Status Message -->
        <div class="status-msg" style="color: ${s.color}">
          ${s.text}
        </div>
        ${s.subtext ? n`<div
              class="status-msg"
              style="font-size: 0.7em; opacity: 0.8; color: ${s.color}"
            >
              ${s.subtext}
            </div>` : ""}

        <div class="actions">
          <button
            class="mode-btn ${e.state === "off" ? "active" : ""}"
            @click=${(c) => this._setMode(c, e.entity_id, "off")}
          >
            Off
          </button>

          <button
            class="mode-btn ${e.state === "auto" ? "active" : ""}"
            @click=${(c) => this._setMode(c, e.entity_id, "auto")}
          >
            Auto
          </button>
        </div>
      </div>
    `;
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
ke.styles = H`
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
    .status-msg {
      font-size: 0.75rem;
      color: var(--secondary-text-color);
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: center;
    }
    .status-msg ha-icon {
      --mdc-icon-size: 14px;
    }
  `;
let ee = ke;
qe([
  v({ attribute: !1 })
], ee.prototype, "hass");
qe([
  v({ type: Boolean })
], ee.prototype, "isAwayMode");
customElements.get("zones-view") || customElements.define("zones-view", ee);
var ft = Object.defineProperty, y = (a, e, t, i) => {
  for (var s = void 0, r = a.length - 1, o; r >= 0; r--)
    (o = a[r]) && (s = o(e, t, s) || s);
  return s && ft(e, t, s), s;
};
const Ae = class Ae extends A {
  constructor() {
    super(...arguments), this.allEntities = [], this._uniqueId = "", this._name = "", this._temperatureSensor = "", this._heaters = /* @__PURE__ */ new Set(), this._thermostats = /* @__PURE__ */ new Set(), this._coolers = /* @__PURE__ */ new Set(), this._windowSensors = /* @__PURE__ */ new Set(), this._filterByArea = !0, this._zoneAreaId = null, this._zoneAreaName = null, this._circuits = [], this._selectedCircuitId = "", this._loading = !1, this._error = "", this._showDeleteDialog = !1;
  }
  async firstUpdated() {
    await this._loadConfig();
  }
  async _loadConfig() {
    var l, h, u;
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
        const p = await this.hass.callWS({
          type: "config/entity_registry/get",
          entity_id: this.zoneId
        });
        this._uniqueId = p.unique_id, p.area_id && (this._zoneAreaId = p.area_id, this._filterByArea = !0);
      } catch (p) {
        console.warn("Could not fetch registry entry:", p);
      }
    if (this._uniqueId && !this._zoneAreaId && ((h = (l = this.hass.entities) == null ? void 0 : l[this.zoneId]) != null && h.area_id) && (this._zoneAreaId = this.hass.entities[this.zoneId].area_id, this._filterByArea = !0), this._zoneAreaId && ((u = this.hass.areas) != null && u[this._zoneAreaId]) && (this._zoneAreaName = this.hass.areas[this._zoneAreaId].name), !this._uniqueId) {
      this._error = "Could not determine Unique ID", this._loading = !1;
      return;
    }
    const t = e.attributes;
    this._name = t.friendly_name || "", this._temperatureSensor = t.temperature_sensor || t.sensor_entity_id || "";
    const i = t.heaters || (t.actuator_entity_id ? [t.actuator_entity_id] : []);
    this._heaters = new Set(i);
    const s = t.thermostats || [];
    this._thermostats = new Set(s);
    const r = t.coolers || [];
    this._coolers = new Set(r);
    const o = t.window_sensors || [];
    this._windowSensors = new Set(o), console.log("Loaded Config:", {
      name: this._name,
      temp: this._temperatureSensor,
      heaters: this._heaters,
      thermostats: this._thermostats,
      coolers: this._coolers
    }), await this._fetchCircuits();
    const c = this._circuits.find(
      (p) => p.member_zones.includes(this._uniqueId)
    );
    this._selectedCircuitId = c ? c.id : "", this._loading = !1;
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
        thermostats: Array.from(this._thermostats),
        coolers: Array.from(this._coolers),
        window_sensors: Array.from(this._windowSensors),
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
    const e = this._getEntityList(["climate", "switch"]), t = this._getEntityList(["climate"]), i = this._getEntityList(["climate"]), s = this._getEntityList(["binary_sensor"]);
    let r = this.allEntities.filter(
      (o) => o.domain === "sensor" && o.device_class === "temperature" || o.domain === "climate" || o.domain === "input_number"
    );
    return this._filterByArea && this._zoneAreaId && (r = r.filter(
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
            ${r.map(
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
          <label>Thermostats (Wall Dials)</label>
          <div class="checkbox-list">
            ${t.map(
      (o) => n`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._thermostats.has(o.entity_id)}
                    @change=${() => this._toggleSet(this._thermostats, o.entity_id)}
                  />
                  <span>${o.name || o.entity_id}</span>
                </div>
              `
    )}
          </div>
        </div>

        <div class="field">
          <label>Coolers</label>
          <div class="checkbox-list">
            ${i.map(
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
            ${s.map(
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
Ae.styles = H`
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
let m = Ae;
y([
  v({ attribute: !1 })
], m.prototype, "hass");
y([
  v({ attribute: !1 })
], m.prototype, "zoneId");
y([
  v({ attribute: !1 })
], m.prototype, "allEntities");
y([
  d()
], m.prototype, "_uniqueId");
y([
  d()
], m.prototype, "_name");
y([
  d()
], m.prototype, "_temperatureSensor");
y([
  d()
], m.prototype, "_heaters");
y([
  d()
], m.prototype, "_thermostats");
y([
  d()
], m.prototype, "_coolers");
y([
  d()
], m.prototype, "_windowSensors");
y([
  d()
], m.prototype, "_filterByArea");
y([
  d()
], m.prototype, "_zoneAreaId");
y([
  d()
], m.prototype, "_zoneAreaName");
y([
  d()
], m.prototype, "_circuits");
y([
  d()
], m.prototype, "_selectedCircuitId");
y([
  d()
], m.prototype, "_loading");
y([
  d()
], m.prototype, "_error");
y([
  d()
], m.prototype, "_showDeleteDialog");
customElements.get("zone-editor") || customElements.define("zone-editor", m);
var vt = Object.defineProperty, W = (a, e, t, i) => {
  for (var s = void 0, r = a.length - 1, o; r >= 0; r--)
    (o = a[r]) && (s = o(e, t, s) || s);
  return s && vt(e, t, s), s;
};
const yt = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], Se = class Se extends A {
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
                      ${yt.map(
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
Se.styles = H`
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
let I = Se;
W([
  v({ attribute: !1 })
], I.prototype, "hass");
W([
  v({ attribute: !1 })
], I.prototype, "zoneId");
W([
  d()
], I.prototype, "_schedule");
W([
  d()
], I.prototype, "_loading");
W([
  d()
], I.prototype, "_uniqueId");
W([
  d()
], I.prototype, "_config");
customElements.get("schedule-editor") || customElements.define("schedule-editor", I);
var bt = Object.defineProperty, U = (a, e, t, i) => {
  for (var s = void 0, r = a.length - 1, o; r >= 0; r--)
    (o = a[r]) && (s = o(e, t, s) || s);
  return s && bt(e, t, s), s;
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
    super.disconnectedCallback(), this._unsubSettings && (this._unsubSettings(), this._unsubSettings = void 0);
  }
  updated(e) {
    super.updated(e), e.has("hass") && this.hass && !this._unsubSettings && this._subscribeSettings();
  }
  async _subscribeSettings() {
    if (this.hass)
      try {
        this._unsubSettings = await this.hass.connection.subscribeEvents(
          (e) => {
            e.data.is_away_mode_on !== void 0 && (this._isAwayMode = e.data.is_away_mode_on);
          },
          "climate_dashboard_settings_updated"
        );
      } catch (e) {
        console.error("Failed to subscribe to settings updates", e);
      }
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
      var i, s, r, o, c, l;
      return {
        entity_id: t.entity_id,
        domain: t.entity_id.split(".")[0],
        name: t.attributes.friendly_name || t.entity_id,
        device_class: t.attributes.device_class,
        area_id: ((s = (i = this.hass.entities) == null ? void 0 : i[t.entity_id]) == null ? void 0 : s.area_id) || ((l = (c = this.hass.devices) == null ? void 0 : c[(o = (r = this.hass.entities) == null ? void 0 : r[t.entity_id]) == null ? void 0 : o.device_id]) == null ? void 0 : l.area_id)
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
Ce.styles = H`
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
let S = Ce;
U([
  v({ attribute: !1 })
], S.prototype, "hass");
U([
  v({ attribute: !1 })
], S.prototype, "narrow");
U([
  v({ attribute: !1 })
], S.prototype, "panel");
U([
  d()
], S.prototype, "_view");
U([
  d()
], S.prototype, "_editingZoneId");
U([
  d()
], S.prototype, "_unmanagedCount");
U([
  d()
], S.prototype, "_isAwayMode");
customElements.get("climate-dashboard") || customElements.define("climate-dashboard", S);
console.info(
  "%c CLIMATE-DASHBOARD %c 0.0.1 ",
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;"
);
