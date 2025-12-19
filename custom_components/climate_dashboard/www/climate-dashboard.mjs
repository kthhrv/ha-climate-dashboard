/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const se = globalThis, _e = se.ShadowRoot && (se.ShadyCSS === void 0 || se.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, fe = Symbol(), Ee = /* @__PURE__ */ new WeakMap();
let Ue = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== fe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (_e && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = Ee.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Ee.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const qe = (a) => new Ue(typeof a == "string" ? a : a + "", void 0, fe), T = (a, ...e) => {
  const t = a.length === 1 ? a[0] : e.reduce((i, s, o) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + a[o + 1], a[0]);
  return new Ue(t, a, fe);
}, We = (a, e) => {
  if (_e) a.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), s = se.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = t.cssText, a.appendChild(i);
  }
}, Ce = _e ? (a) => a : (a) => a instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return qe(t);
})(a) : a;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Fe, defineProperty: Ge, getOwnPropertyDescriptor: Je, getOwnPropertyNames: Ke, getOwnPropertySymbols: Ve, getPrototypeOf: Xe } = Object, I = globalThis, Ie = I.trustedTypes, Ye = Ie ? Ie.emptyScript : "", he = I.reactiveElementPolyfillSupport, K = (a, e) => a, oe = { toAttribute(a, e) {
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
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), I.litPropertyMetadata ?? (I.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let U = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = ze) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(e, i, t);
      s !== void 0 && Ge(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: s, set: o } = Je(this.prototype, e) ?? { get() {
      return this[t];
    }, set(r) {
      this[t] = r;
    } };
    return { get: s, set(r) {
      const n = s == null ? void 0 : s.call(this);
      o == null || o.call(this, r), this.requestUpdate(e, n, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ze;
  }
  static _$Ei() {
    if (this.hasOwnProperty(K("elementProperties"))) return;
    const e = Xe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(K("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(K("properties"))) {
      const t = this.properties, i = [...Ke(t), ...Ve(t)];
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
      for (const s of i) t.unshift(Ce(s));
    } else e !== void 0 && t.push(Ce(e));
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
    return We(e, this.constructor.elementStyles), e;
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
      const r = (((o = i.converter) == null ? void 0 : o.toAttribute) !== void 0 ? i.converter : oe).toAttribute(t, i.type);
      this._$Em = e, r == null ? this.removeAttribute(s) : this.setAttribute(s, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var o, r;
    const i = this.constructor, s = i._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const n = i.getPropertyOptions(s), d = typeof n.converter == "function" ? { fromAttribute: n.converter } : ((o = n.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? n.converter : oe;
      this._$Em = s;
      const c = d.fromAttribute(t, n.type);
      this[s] = c ?? ((r = this._$Ej) == null ? void 0 : r.get(s)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, i) {
    var s;
    if (e !== void 0) {
      const o = this.constructor, r = this[e];
      if (i ?? (i = o.getPropertyOptions(e)), !((i.hasChanged ?? ge)(r, t) || i.useDefault && i.reflect && r === ((s = this._$Ej) == null ? void 0 : s.get(e)) && !this.hasAttribute(o._$Eu(e, i)))) return;
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
        const { wrapped: n } = r, d = this[o];
        n !== !0 || this._$AL.has(o) || d === void 0 || this.C(o, void 0, r, d);
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
U.elementStyles = [], U.shadowRootOptions = { mode: "open" }, U[K("elementProperties")] = /* @__PURE__ */ new Map(), U[K("finalized")] = /* @__PURE__ */ new Map(), he == null || he({ ReactiveElement: U }), (I.reactiveElementVersions ?? (I.reactiveElementVersions = [])).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const V = globalThis, re = V.trustedTypes, De = re ? re.createPolicy("lit-html", { createHTML: (a) => a }) : void 0, He = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, je = "?" + C, Qe = `<${je}>`, P = document, X = () => P.createComment(""), Y = (a) => a === null || typeof a != "object" && typeof a != "function", ve = Array.isArray, et = (a) => ve(a) || typeof (a == null ? void 0 : a[Symbol.iterator]) == "function", pe = `[ 	
\f\r]`, J = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ne = /-->/g, Oe = />/g, D = RegExp(`>|${pe}(?:([^\\s"'>=/]+)(${pe}*=${pe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Pe = /'/g, Te = /"/g, Le = /^(?:script|style|textarea|title)$/i, tt = (a) => (e, ...t) => ({ _$litType$: a, strings: e, values: t }), l = tt(1), H = Symbol.for("lit-noChange"), g = Symbol.for("lit-nothing"), Me = /* @__PURE__ */ new WeakMap(), N = P.createTreeWalker(P, 129);
function Ze(a, e) {
  if (!ve(a) || !a.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return De !== void 0 ? De.createHTML(e) : e;
}
const it = (a, e) => {
  const t = a.length - 1, i = [];
  let s, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = J;
  for (let n = 0; n < t; n++) {
    const d = a[n];
    let c, p, h = -1, m = 0;
    for (; m < d.length && (r.lastIndex = m, p = r.exec(d), p !== null); ) m = r.lastIndex, r === J ? p[1] === "!--" ? r = Ne : p[1] !== void 0 ? r = Oe : p[2] !== void 0 ? (Le.test(p[2]) && (s = RegExp("</" + p[2], "g")), r = D) : p[3] !== void 0 && (r = D) : r === D ? p[0] === ">" ? (r = s ?? J, h = -1) : p[1] === void 0 ? h = -2 : (h = r.lastIndex - p[2].length, c = p[1], r = p[3] === void 0 ? D : p[3] === '"' ? Te : Pe) : r === Te || r === Pe ? r = D : r === Ne || r === Oe ? r = J : (r = D, s = void 0);
    const _ = r === D && a[n + 1].startsWith("/>") ? " " : "";
    o += r === J ? d + Qe : h >= 0 ? (i.push(c), d.slice(0, h) + He + d.slice(h) + C + _) : d + C + (h === -2 ? n : _);
  }
  return [Ze(a, o + (a[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Q {
  constructor({ strings: e, _$litType$: t }, i) {
    let s;
    this.parts = [];
    let o = 0, r = 0;
    const n = e.length - 1, d = this.parts, [c, p] = it(e, t);
    if (this.el = Q.createElement(c, i), N.currentNode = this.el.content, t === 2 || t === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (s = N.nextNode()) !== null && d.length < n; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const h of s.getAttributeNames()) if (h.endsWith(He)) {
          const m = p[r++], _ = s.getAttribute(h).split(C), v = /([.?@])?(.*)/.exec(m);
          d.push({ type: 1, index: o, name: v[2], strings: _, ctor: v[1] === "." ? ot : v[1] === "?" ? rt : v[1] === "@" ? at : ne }), s.removeAttribute(h);
        } else h.startsWith(C) && (d.push({ type: 6, index: o }), s.removeAttribute(h));
        if (Le.test(s.tagName)) {
          const h = s.textContent.split(C), m = h.length - 1;
          if (m > 0) {
            s.textContent = re ? re.emptyScript : "";
            for (let _ = 0; _ < m; _++) s.append(h[_], X()), N.nextNode(), d.push({ type: 2, index: ++o });
            s.append(h[m], X());
          }
        }
      } else if (s.nodeType === 8) if (s.data === je) d.push({ type: 2, index: o });
      else {
        let h = -1;
        for (; (h = s.data.indexOf(C, h + 1)) !== -1; ) d.push({ type: 7, index: o }), h += C.length - 1;
      }
      o++;
    }
  }
  static createElement(e, t) {
    const i = P.createElement("template");
    return i.innerHTML = e, i;
  }
}
function j(a, e, t = a, i) {
  var r, n;
  if (e === H) return e;
  let s = i !== void 0 ? (r = t._$Co) == null ? void 0 : r[i] : t._$Cl;
  const o = Y(e) ? void 0 : e._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== o && ((n = s == null ? void 0 : s._$AO) == null || n.call(s, !1), o === void 0 ? s = void 0 : (s = new o(a), s._$AT(a, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = s : t._$Cl = s), s !== void 0 && (e = j(a, s._$AS(a, e.values), s, i)), e;
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
    const { el: { content: t }, parts: i } = this._$AD, s = ((e == null ? void 0 : e.creationScope) ?? P).importNode(t, !0);
    N.currentNode = s;
    let o = N.nextNode(), r = 0, n = 0, d = i[0];
    for (; d !== void 0; ) {
      if (r === d.index) {
        let c;
        d.type === 2 ? c = new ee(o, o.nextSibling, this, e) : d.type === 1 ? c = new d.ctor(o, d.name, d.strings, this, e) : d.type === 6 && (c = new nt(o, this, e)), this._$AV.push(c), d = i[++n];
      }
      r !== (d == null ? void 0 : d.index) && (o = N.nextNode(), r++);
    }
    return N.currentNode = P, s;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class ee {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, i, s) {
    this.type = 2, this._$AH = g, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = s, this._$Cv = (s == null ? void 0 : s.isConnected) ?? !0;
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
    e = j(this, e, t), Y(e) ? e === g || e == null || e === "" ? (this._$AH !== g && this._$AR(), this._$AH = g) : e !== this._$AH && e !== H && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : et(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== g && Y(this._$AH) ? this._$AA.nextSibling.data = e : this.T(P.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var o;
    const { values: t, _$litType$: i } = e, s = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Q.createElement(Ze(i.h, i.h[0]), this.options)), i);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === s) this._$AH.p(t);
    else {
      const r = new st(s, this), n = r.u(this.options);
      r.p(t), this.T(n), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = Me.get(e.strings);
    return t === void 0 && Me.set(e.strings, t = new Q(e)), t;
  }
  k(e) {
    ve(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, s = 0;
    for (const o of e) s === t.length ? t.push(i = new ee(this.O(X()), this.O(X()), this, this.options)) : i = t[s], i._$AI(o), s++;
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
    this.type = 1, this._$AH = g, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = g;
  }
  _$AI(e, t = this, i, s) {
    const o = this.strings;
    let r = !1;
    if (o === void 0) e = j(this, e, t, 0), r = !Y(e) || e !== this._$AH && e !== H, r && (this._$AH = e);
    else {
      const n = e;
      let d, c;
      for (e = o[0], d = 0; d < o.length - 1; d++) c = j(this, n[i + d], t, d), c === H && (c = this._$AH[d]), r || (r = !Y(c) || c !== this._$AH[d]), c === g ? e = g : e !== g && (e += (c ?? "") + o[d + 1]), this._$AH[d] = c;
    }
    r && !s && this.j(e);
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
  constructor(e, t, i, s, o) {
    super(e, t, i, s, o), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = j(this, e, t, 0) ?? g) === H) return;
    const i = this._$AH, s = e === g && i !== g || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, o = e !== g && (i === g || s);
    s && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class nt {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    j(this, e);
  }
}
const ue = V.litHtmlPolyfillSupport;
ue == null || ue(Q, ee), (V.litHtmlVersions ?? (V.litHtmlVersions = [])).push("3.3.1");
const lt = (a, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let s = i._$litPart$;
  if (s === void 0) {
    const o = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = s = new ee(e.insertBefore(X(), o), o, void 0, t ?? {});
  }
  return s._$AI(a), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis;
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
w._$litElement$ = !0, w.finalized = !0, (Be = O.litElementHydrateSupport) == null || Be.call(O, { LitElement: w });
const me = O.litElementPolyfillSupport;
me == null || me({ LitElement: w });
(O.litElementVersions ?? (O.litElementVersions = [])).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dt = { attribute: !0, type: String, converter: oe, reflect: !1, hasChanged: ge }, ct = (a = dt, e, t) => {
  const { kind: i, metadata: s } = t;
  let o = globalThis.litPropertyMetadata.get(s);
  if (o === void 0 && globalThis.litPropertyMetadata.set(s, o = /* @__PURE__ */ new Map()), i === "setter" && ((a = Object.create(a)).wrapped = !0), o.set(t.name, a), i === "accessor") {
    const { name: r } = t;
    return { set(n) {
      const d = e.get.call(this);
      e.set.call(this, n), this.requestUpdate(r, d, a);
    }, init(n) {
      return n !== void 0 && this.C(r, void 0, a, n), n;
    } };
  }
  if (i === "setter") {
    const { name: r } = t;
    return function(n) {
      const d = this[r];
      e.call(this, n), this.requestUpdate(r, d, a);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function y(a) {
  return (e, t) => typeof t == "object" ? ct(a, e, t) : ((i, s, o) => {
    const r = s.hasOwnProperty(o);
    return s.constructor.createProperty(o, i), r ? Object.getOwnPropertyDescriptor(s, o) : void 0;
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
var ht = Object.defineProperty, x = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && ht(e, t, s), s;
};
const be = class be extends w {
  constructor() {
    super(...arguments), this.open = !1, this.entities = [], this.preselected = null, this._name = "", this._temperatureSensor = "", this._heaters = /* @__PURE__ */ new Set(), this._coolers = /* @__PURE__ */ new Set(), this._windowSensors = /* @__PURE__ */ new Set(), this._roomType = "generic", this._filterByArea = !0, this._targetAreaId = null, this._targetAreaName = null;
  }
  updated(e) {
    if (e.has("open") && this.open && this.preselected) {
      const t = this.entities.find((i) => i.entity_id === this.preselected);
      if (t) {
        this._name = t.area_name || t.name || t.entity_id.split(".")[1], this._heaters.clear(), this._coolers.clear(), this._windowSensors.clear(), t.area_id ? (this._targetAreaId = t.area_id, this._targetAreaName = t.area_name || "Zone Area", this._filterByArea = !0) : (this._targetAreaId = null, this._targetAreaName = null, this._filterByArea = !1);
        const i = this._name.toLowerCase();
        i.includes("bedroom") || i.includes("sleeping") ? this._roomType = "bedroom" : i.includes("living") || i.includes("lounge") ? this._roomType = "living_room" : i.includes("office") || i.includes("study") ? this._roomType = "office" : this._roomType = "generic", t.domain === "climate" ? (this._heaters.add(t.entity_id), this._temperatureSensor = t.entity_id) : t.domain === "switch" && this._heaters.add(t.entity_id), this.requestUpdate();
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
      room_type: this._roomType
    }), this.dispatchEvent(new CustomEvent("close"));
  }
  render() {
    const e = this._getEntityList(["climate", "switch"]), t = this._getEntityList(["climate"]), i = this._getEntityList(["binary_sensor"]), s = this._getSensors();
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
            ${s.map(
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
            ${i.map(
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
            ${i.length === 0 ? l`<div style="color:var(--secondary-text-color)">
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
var pt = Object.defineProperty, Z = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && pt(e, t, s), s;
};
const $e = class $e extends w {
  constructor() {
    super(...arguments), this._devices = [], this._loading = !1, this._settings = {
      default_override_type: "next_block",
      default_timer_minutes: 60,
      window_open_delay_seconds: 30
    }, this._dialogOpen = !1, this._selectedEntity = null;
  }
  firstUpdated() {
    this._fetchDevices(), this._fetchSettings();
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
    return l`
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

        ${this._settings.default_override_type === "duration" ? l`
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
      </div>

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
let A = $e;
Z([
  y({ attribute: !1 })
], A.prototype, "hass");
Z([
  u()
], A.prototype, "_devices");
Z([
  u()
], A.prototype, "_loading");
Z([
  u()
], A.prototype, "_settings");
Z([
  u()
], A.prototype, "_dialogOpen");
Z([
  u()
], A.prototype, "_selectedEntity");
customElements.get("setup-view") || customElements.define("setup-view", A);
var ut = Object.defineProperty, ye = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && ut(e, t, s), s;
};
const xe = class xe extends w {
  constructor() {
    super(...arguments), this._selectedDay = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
  }
  render() {
    if (!this.hass) return l``;
    const e = this._getGroupedZones(), t = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], i = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
    return l`
      <div class="card">
        <h2>Timeline</h2>

        <div class="day-selector">
          ${t.map(
      (s) => l`
              <button
                class="day-tab ${this._selectedDay === s ? "active" : ""}"
                @click=${() => this._selectedDay = s}
              >
                ${s.toUpperCase()}
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
      (s) => l`
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
                ${e.map((s) => l`
                    ${s.floorName ? l`
                          <div class="floor-header">
                            <ha-icon
                              icon="${s.floorIcon || "mdi:home-floor-1"}"
                            ></ha-icon>
                            ${s.floorName}
                          </div>
                        ` : l``}
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
      var h, m, _;
      const n = (h = this.hass.entities) == null ? void 0 : h[r.entity_id], d = n == null ? void 0 : n.area_id, c = d ? (m = this.hass.areas) == null ? void 0 : m[d] : null, p = c == null ? void 0 : c.floor_id;
      if (p && ((_ = this.hass.floors) != null && _[p])) {
        const v = this.hass.floors[p];
        t[p] || (t[p] = {
          floorName: v.name,
          floorIcon: v.icon,
          level: v.level,
          zones: []
        }), t[p].zones.push(r);
      } else
        i.push(r);
    });
    const o = Object.values(t).sort((r, n) => r.level !== null && n.level !== null ? n.level - r.level : r.floorName.localeCompare(n.floorName)).map((r) => ({
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
    const i = e.attributes.schedule || [], s = (e.attributes.heaters || []).length > 0, o = (e.attributes.coolers || []).length > 0;
    let r = "off";
    s && o ? r = "auto" : s ? r = "heat" : o && (r = "cool");
    const n = i.filter(
      (c) => c.days.includes(t)
    );
    if (n.sort(
      (c, p) => c.start_time.localeCompare(p.start_time)
    ), (n.length > 0 ? n[0].start_time : "24:00") > "00:00") {
      const c = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], p = c.indexOf(t);
      let h = null;
      for (let m = 1; m <= 7; m++) {
        const _ = (p - m + 7) % 7, v = c[_], M = i.filter(
          (W) => W.days.includes(v)
        );
        if (M.length > 0) {
          M.sort(
            (W, le) => W.start_time.localeCompare(le.start_time)
          ), h = M[M.length - 1];
          break;
        }
      }
      if (h) {
        const m = {
          ...h,
          start_time: "00:00",
          name: `Carry-over (${h.name})`
          // We render this block effectively from 00:00 to the start of the next block
        };
        n.unshift(m);
      }
    }
    return n.map((c, p) => {
      const [h, m] = c.start_time.split(":").map(Number), _ = h * 60 + m;
      let v = 1440;
      if (p < n.length - 1) {
        const z = n[p + 1], [de, ce] = z.start_time.split(":").map(Number);
        v = de * 60 + ce;
      }
      const M = v - _, W = _ / 1440 * 100, le = M / 1440 * 100;
      let B = "";
      const F = c.temp_heat ?? 20, te = c.temp_cool ?? 24, E = 16, ie = 24;
      let G = 1;
      if (r === "heat") {
        B = `${F}°`;
        const z = (F - E) / (ie - E);
        G = 0.4 + 0.6 * Math.min(Math.max(z, 0), 1);
      } else if (r === "cool") {
        B = `${te}°`;
        const z = (te - E) / (ie - E);
        G = 0.4 + 0.6 * Math.min(Math.max(z, 0), 1);
      } else if (r === "auto") {
        B = `${F}-${te}°`;
        const z = (F - E) / (ie - E), de = 0.4 + 0.6 * Math.min(Math.max(z, 0), 1), ce = (te - E) / (ie - E), Re = 0.4 + 0.6 * Math.min(Math.max(ce, 0), 1);
        G = Math.max(de, Re);
      } else
        B = `${F}°`, G = 0.5;
      return l`
        <div
          class="schedule-block mode-${r}"
          style="left: ${W}%; width: ${le}%; --block-opacity: ${G.toFixed(
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
    const e = /* @__PURE__ */ new Date(), i = (e.getHours() * 60 + e.getMinutes()) / 1440 * 100;
    return l`
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
var mt = Object.defineProperty, _t = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && mt(e, t, s), s;
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
            ${t.zones.map((i) => this._renderZoneCard(i))}
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
    const t = {}, i = [];
    e.forEach((r) => {
      var h, m, _;
      const n = (h = this.hass.entities) == null ? void 0 : h[r.entity_id], d = n == null ? void 0 : n.area_id, c = d ? (m = this.hass.areas) == null ? void 0 : m[d] : null, p = c == null ? void 0 : c.floor_id;
      if (p && ((_ = this.hass.floors) != null && _[p])) {
        const v = this.hass.floors[p];
        t[p] || (t[p] = {
          floorName: v.name,
          floorIcon: v.icon,
          level: v.level,
          zones: []
        }), t[p].zones.push(r);
      } else
        i.push(r);
    });
    const o = Object.values(t).sort((r, n) => r.level !== null && n.level !== null ? n.level - r.level : r.floorName.localeCompare(n.floorName)).map((r) => ({
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
    return l`
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
    const t = e.attributes.next_scheduled_change, i = e.attributes.override_end, s = e.attributes.override_type, o = e.state;
    let r = "";
    if (e.attributes.safety_mode)
      r = "Sensor Unavailable: Safety Mode active";
    else if (e.attributes.using_fallback_sensor)
      r = "Warning: Using Area Fallback Sensor";
    else if (e.attributes.open_window_sensor)
      r = `${e.attributes.open_window_sensor} open`;
    else if (i) {
      const n = new Date(i).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      s === "duration" ? r = `Timer until ${n}` : r = `Until ${n}`;
    } else if (o === "auto" && t) {
      const n = new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }), d = e.attributes.next_scheduled_temp_heat, c = e.attributes.next_scheduled_temp_cool, p = e.attributes.hvac_modes || [], h = p.includes("heat"), m = p.includes("cool");
      let _ = l``;
      if (h && m && d != null && c != null ? _ = l`<span class="heat">${d}°</span>/<span class="cool"
            >${c}°</span
          >` : h && d != null ? _ = l`<span class="heat">${d}°</span>` : m && c != null && (_ = l`<span class="cool">${c}°</span>`), h && d != null || m && c != null)
        return l`
          <div
            style="font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px;"
          >
            ${n} -> ${_}
          </div>
        `;
      r = `${n}`;
    }
    return r ? l`
      <div
        style="font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px;"
      >
        ${r}
      </div>
    ` : l``;
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
    .heat {
      color: var(--state-climate-heat-color, #ff9800);
      font-weight: 500;
    }
    .cool {
      color: var(--state-climate-cool-color, #2196f3);
      font-weight: 500;
    }
  `;
let ae = we;
_t([
  y({ attribute: !1 })
], ae.prototype, "hass");
customElements.get("zones-view") || customElements.define("zones-view", ae);
var ft = Object.defineProperty, $ = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && ft(e, t, s), s;
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
    }), this._loading = !1;
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
    const e = this._getEntityList(["climate", "switch"]), t = this._getEntityList(["climate"]), i = this._getEntityList(["binary_sensor"]);
    let s = this.allEntities.filter(
      (o) => o.domain === "sensor" && o.device_class === "temperature" || o.domain === "climate"
    );
    return this._filterByArea && this._zoneAreaId && (s = s.filter(
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
            ${s.map(
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
            ${i.map(
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
let f = Ae;
$([
  y({ attribute: !1 })
], f.prototype, "hass");
$([
  y({ attribute: !1 })
], f.prototype, "zoneId");
$([
  y({ attribute: !1 })
], f.prototype, "allEntities");
$([
  u()
], f.prototype, "_uniqueId");
$([
  u()
], f.prototype, "_name");
$([
  u()
], f.prototype, "_temperatureSensor");
$([
  u()
], f.prototype, "_heaters");
$([
  u()
], f.prototype, "_coolers");
$([
  u()
], f.prototype, "_windowSensors");
$([
  u()
], f.prototype, "_restoreDelayMinutes");
$([
  u()
], f.prototype, "_filterByArea");
$([
  u()
], f.prototype, "_zoneAreaId");
$([
  u()
], f.prototype, "_zoneAreaName");
$([
  u()
], f.prototype, "_loading");
$([
  u()
], f.prototype, "_error");
$([
  u()
], f.prototype, "_showDeleteDialog");
customElements.get("zone-editor") || customElements.define("zone-editor", f);
var gt = Object.defineProperty, R = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && gt(e, t, s), s;
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
                  ${this._config.heaters.length > 0 ? l`
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
                  ${this._config.coolers.length > 0 ? l`
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
        (i) => l`
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
let k = ke;
R([
  y({ attribute: !1 })
], k.prototype, "hass");
R([
  y({ attribute: !1 })
], k.prototype, "zoneId");
R([
  u()
], k.prototype, "_schedule");
R([
  u()
], k.prototype, "_loading");
R([
  u()
], k.prototype, "_uniqueId");
R([
  u()
], k.prototype, "_config");
customElements.get("schedule-editor") || customElements.define("schedule-editor", k);
var yt = Object.defineProperty, q = (a, e, t, i) => {
  for (var s = void 0, o = a.length - 1, r; o >= 0; o--)
    (r = a[o]) && (s = r(e, t, s) || s);
  return s && yt(e, t, s), s;
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
      var i, s;
      return {
        entity_id: t.entity_id,
        domain: t.entity_id.split(".")[0],
        name: t.attributes.friendly_name || t.entity_id,
        device_class: t.attributes.device_class,
        area_id: (s = (i = this.hass.entities) == null ? void 0 : i[t.entity_id]) == null ? void 0 : s.area_id
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
let S = Se;
q([
  y({ attribute: !1 })
], S.prototype, "hass");
q([
  y({ attribute: !1 })
], S.prototype, "narrow");
q([
  y({ attribute: !1 })
], S.prototype, "panel");
q([
  u()
], S.prototype, "_view");
q([
  u()
], S.prototype, "_editingZoneId");
q([
  u()
], S.prototype, "_unmanagedCount");
customElements.get("climate-dashboard") || customElements.define("climate-dashboard", S);
console.info(
  "%c CLIMATE-DASHBOARD %c 0.0.1 ",
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;"
);
