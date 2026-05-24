/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ae = globalThis, ji = Ae.ShadowRoot && (Ae.ShadyCSS === void 0 || Ae.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Fi = Symbol(), mr = /* @__PURE__ */ new WeakMap();
let ws = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== Fi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (ji && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = mr.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && mr.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const mo = (s) => new ws(typeof s == "string" ? s : s + "", void 0, Fi), st = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new ws(e, s, Fi);
}, fo = (s, t) => {
  if (ji) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), r = Ae.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  }
}, fr = ji ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return mo(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: vo, defineProperty: go, getOwnPropertyDescriptor: _o, getOwnPropertyNames: yo, getOwnPropertySymbols: bo, getPrototypeOf: $o } = Object, et = globalThis, vr = et.trustedTypes, xo = vr ? vr.emptyScript : "", qe = et.reactiveElementPolyfillSupport, te = (s, t) => s, Pe = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? xo : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, Wi = (s, t) => !vo(s, t), gr = { attribute: !0, type: String, converter: Pe, reflect: !1, useDefault: !1, hasChanged: Wi };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), et.litPropertyMetadata ?? (et.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Pt = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = gr) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && go(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: r, set: n } = _o(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const l = r == null ? void 0 : r.call(this);
      n == null || n.call(this, o), this.requestUpdate(t, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? gr;
  }
  static _$Ei() {
    if (this.hasOwnProperty(te("elementProperties"))) return;
    const t = $o(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(te("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(te("properties"))) {
      const e = this.properties, i = [...yo(e), ...bo(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, r] of e) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const r = this._$Eu(e, i);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(fr(r));
    } else t !== void 0 && e.push(fr(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return fo(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) == null ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) == null ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    var n;
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const o = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : Pe).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var n, o;
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const l = i.getPropertyOptions(r), a = typeof l.converter == "function" ? { fromAttribute: l.converter } : ((n = l.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? l.converter : Pe;
      this._$Em = r;
      const c = a.fromAttribute(e, l.type);
      this[r] = c ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, e, i) {
    var r;
    if (t !== void 0) {
      const n = this.constructor, o = this[t];
      if (i ?? (i = n.getPropertyOptions(t)), !((i.hasChanged ?? Wi)(o, e) || i.useDefault && i.reflect && o === ((r = this._$Ej) == null ? void 0 : r.get(t)) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: r, wrapped: n }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [n, o] of r) {
        const { wrapped: l } = o, a = this[n];
        l !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, o, a);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (i = this._$EO) == null || i.forEach((r) => {
        var n;
        return (n = r.hostUpdate) == null ? void 0 : n.call(r);
      }), this.update(e)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((i) => {
      var r;
      return (r = i.hostUpdated) == null ? void 0 : r.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
Pt.elementStyles = [], Pt.shadowRootOptions = { mode: "open" }, Pt[te("elementProperties")] = /* @__PURE__ */ new Map(), Pt[te("finalized")] = /* @__PURE__ */ new Map(), qe == null || qe({ ReactiveElement: Pt }), (et.reactiveElementVersions ?? (et.reactiveElementVersions = [])).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ee = globalThis, Ue = ee.trustedTypes, _r = Ue ? Ue.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, As = "$lit$", J = `lit$${Math.random().toFixed(9).slice(2)}$`, Ss = "?" + J, wo = `<${Ss}>`, xt = document, ne = () => xt.createComment(""), ae = (s) => s === null || typeof s != "object" && typeof s != "function", qi = Array.isArray, Ao = (s) => qi(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", Ze = `[ 	
\f\r]`, Kt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, yr = /-->/g, br = />/g, pt = RegExp(`>|${Ze}(?:([^\\s"'>=/]+)(${Ze}*=${Ze}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), $r = /'/g, xr = /"/g, Cs = /^(?:script|style|textarea|title)$/i, So = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), u = So(1), Tt = Symbol.for("lit-noChange"), E = Symbol.for("lit-nothing"), wr = /* @__PURE__ */ new WeakMap(), vt = xt.createTreeWalker(xt, 129);
function Es(s, t) {
  if (!qi(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _r !== void 0 ? _r.createHTML(t) : t;
}
const Co = (s, t) => {
  const e = s.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Kt;
  for (let l = 0; l < e; l++) {
    const a = s[l];
    let c, p, d = -1, h = 0;
    for (; h < a.length && (o.lastIndex = h, p = o.exec(a), p !== null); ) h = o.lastIndex, o === Kt ? p[1] === "!--" ? o = yr : p[1] !== void 0 ? o = br : p[2] !== void 0 ? (Cs.test(p[2]) && (r = RegExp("</" + p[2], "g")), o = pt) : p[3] !== void 0 && (o = pt) : o === pt ? p[0] === ">" ? (o = r ?? Kt, d = -1) : p[1] === void 0 ? d = -2 : (d = o.lastIndex - p[2].length, c = p[1], o = p[3] === void 0 ? pt : p[3] === '"' ? xr : $r) : o === xr || o === $r ? o = pt : o === yr || o === br ? o = Kt : (o = pt, r = void 0);
    const m = o === pt && s[l + 1].startsWith("/>") ? " " : "";
    n += o === Kt ? a + wo : d >= 0 ? (i.push(c), a.slice(0, d) + As + a.slice(d) + J + m) : a + J + (d === -2 ? l : m);
  }
  return [Es(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
let xi = class ks {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, a = this.parts, [c, p] = Co(t, e);
    if (this.el = ks.createElement(c, i), vt.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (r = vt.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const d of r.getAttributeNames()) if (d.endsWith(As)) {
          const h = p[o++], m = r.getAttribute(d).split(J), _ = /([.?@])?(.*)/.exec(h);
          a.push({ type: 1, index: n, name: _[2], strings: m, ctor: _[1] === "." ? ko : _[1] === "?" ? Ho : _[1] === "@" ? Po : Be }), r.removeAttribute(d);
        } else d.startsWith(J) && (a.push({ type: 6, index: n }), r.removeAttribute(d));
        if (Cs.test(r.tagName)) {
          const d = r.textContent.split(J), h = d.length - 1;
          if (h > 0) {
            r.textContent = Ue ? Ue.emptyScript : "";
            for (let m = 0; m < h; m++) r.append(d[m], ne()), vt.nextNode(), a.push({ type: 2, index: ++n });
            r.append(d[h], ne());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Ss) a.push({ type: 2, index: n });
      else {
        let d = -1;
        for (; (d = r.data.indexOf(J, d + 1)) !== -1; ) a.push({ type: 7, index: n }), d += J.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = xt.createElement("template");
    return i.innerHTML = t, i;
  }
};
function Ot(s, t, e = s, i) {
  var o, l;
  if (t === Tt) return t;
  let r = i !== void 0 ? (o = e._$Co) == null ? void 0 : o[i] : e._$Cl;
  const n = ae(t) ? void 0 : t._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((l = r == null ? void 0 : r._$AO) == null || l.call(r, !1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = r : e._$Cl = r), r !== void 0 && (t = Ot(s, r._$AS(s, t.values), r, i)), t;
}
let Eo = class {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: i } = this._$AD, r = ((t == null ? void 0 : t.creationScope) ?? xt).importNode(e, !0);
    vt.currentNode = r;
    let n = vt.nextNode(), o = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let c;
        a.type === 2 ? c = new Zi(n, n.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(n, a.name, a.strings, this, t) : a.type === 6 && (c = new Uo(n, this, t)), this._$AV.push(c), a = i[++l];
      }
      o !== (a == null ? void 0 : a.index) && (n = vt.nextNode(), o++);
    }
    return vt.currentNode = xt, r;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}, Zi = class Hs {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, i, r) {
    this.type = 2, this._$AH = E, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = Ot(this, t, e), ae(t) ? t === E || t == null || t === "" ? (this._$AH !== E && this._$AR(), this._$AH = E) : t !== this._$AH && t !== Tt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ao(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== E && ae(this._$AH) ? this._$AA.nextSibling.data = t : this.T(xt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: e, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = xi.createElement(Es(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(e);
    else {
      const o = new Eo(r, this), l = o.u(this.options);
      o.p(e), this.T(l), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = wr.get(t.strings);
    return e === void 0 && wr.set(t.strings, e = new xi(t)), e;
  }
  k(t) {
    qi(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const n of t) r === e.length ? e.push(i = new Hs(this.O(ne()), this.O(ne()), this, this.options)) : i = e[r], i._$AI(n), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, e); t !== this._$AB; ) {
      const r = t.nextSibling;
      t.remove(), t = r;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}, Be = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, r, n) {
    this.type = 1, this._$AH = E, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = E;
  }
  _$AI(t, e = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = Ot(this, t, e, 0), o = !ae(t) || t !== this._$AH && t !== Tt, o && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = n[0], a = 0; a < n.length - 1; a++) c = Ot(this, l[i + a], e, a), c === Tt && (c = this._$AH[a]), o || (o = !ae(c) || c !== this._$AH[a]), c === E ? t = E : t !== E && (t += (c ?? "") + n[a + 1]), this._$AH[a] = c;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}, ko = class extends Be {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === E ? void 0 : t;
  }
}, Ho = class extends Be {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== E);
  }
}, Po = class extends Be {
  constructor(t, e, i, r, n) {
    super(t, e, i, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = Ot(this, t, e, 0) ?? E) === Tt) return;
    const i = this._$AH, r = t === E && i !== E || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== E && (i === E || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}, Uo = class {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Ot(this, t);
  }
};
const Ge = ee.litHtmlPolyfillSupport;
Ge == null || Ge(xi, Zi), (ee.litHtmlVersions ?? (ee.litHtmlVersions = [])).push("3.3.1");
const Ro = (s, t, e) => {
  const i = (e == null ? void 0 : e.renderBefore) ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = (e == null ? void 0 : e.renderBefore) ?? null;
    i._$litPart$ = r = new Zi(t.insertBefore(ne(), n), n, void 0, e ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $t = globalThis;
let I = class extends Pt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ro(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return Tt;
  }
};
var xs;
I._$litElement$ = !0, I.finalized = !0, (xs = $t.litElementHydrateSupport) == null || xs.call($t, { LitElement: I });
const Ve = $t.litElementPolyfillSupport;
Ve == null || Ve({ LitElement: I });
($t.litElementVersions ?? ($t.litElementVersions = [])).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zo = { attribute: !0, type: String, converter: Pe, reflect: !1, hasChanged: Wi }, Mo = (s = zo, t, e) => {
  const { kind: i, metadata: r } = e;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), i === "setter" && ((s = Object.create(s)).wrapped = !0), n.set(e.name, s), i === "accessor") {
    const { name: o } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(o, a, s);
    }, init(l) {
      return l !== void 0 && this.C(o, void 0, s, l), l;
    } };
  }
  if (i === "setter") {
    const { name: o } = e;
    return function(l) {
      const a = this[o];
      t.call(this, l), this.requestUpdate(o, a, s);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function S(s) {
  return (t, e) => typeof e == "object" ? Mo(s, t, e) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(s, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function f(s) {
  return S({ ...s, state: !0, attribute: !1 });
}
var To = Object.defineProperty, R = (s, t, e, i) => {
  for (var r = void 0, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = o(t, e, r) || r);
  return r && To(t, e, r), r;
};
const or = class or extends I {
  constructor() {
    super(...arguments), this.open = !1, this.entities = [], this.preselected = null, this._name = "", this._temperatureSensor = "", this._heaters = /* @__PURE__ */ new Set(), this._thermostats = /* @__PURE__ */ new Set(), this._coolers = /* @__PURE__ */ new Set(), this._windowSensors = /* @__PURE__ */ new Set(), this._roomType = "generic", this._filterByArea = !0, this._targetAreaId = null, this._targetAreaName = null, this._circuits = [], this._selectedCircuit = "";
  }
  updated(t) {
    if (t.has("open") && this.open && this.preselected) {
      const e = this.entities.find((i) => i.entity_id === this.preselected);
      if (e) {
        this._name = e.area_name || e.name || e.entity_id.split(".")[1], this._heaters.clear(), this._thermostats.clear(), this._coolers.clear(), this._windowSensors.clear(), e.area_id ? (this._targetAreaId = e.area_id, this._targetAreaName = e.area_name || "Zone Area", this._filterByArea = !0) : (this._targetAreaId = null, this._targetAreaName = null, this._filterByArea = !1);
        const i = this._name.toLowerCase();
        i.includes("bedroom") || i.includes("sleeping") ? this._roomType = "bedroom" : i.includes("living") || i.includes("lounge") ? this._roomType = "living_room" : i.includes("office") || i.includes("study") ? this._roomType = "office" : this._roomType = "generic", e.domain === "climate" ? (this._heaters.add(e.entity_id), this._temperatureSensor = e.entity_id) : e.domain === "switch" && this._heaters.add(e.entity_id), this.hass.callWS({ type: "climate_dashboard/circuit/list" }).then((r) => {
          this._circuits = r, this._selectedCircuit && !r.find((n) => n.id === this._selectedCircuit) && (this._selectedCircuit = "");
        }), this.requestUpdate();
      }
    }
  }
  _getEntityList(t) {
    let e = this.entities.filter((i) => t.includes(i.domain));
    return this._filterByArea && this._targetAreaId && (e = e.filter((i) => i.area_id === this._targetAreaId)), e;
  }
  _getSensors() {
    let t = this.entities.filter(
      (e) => e.domain === "sensor" && e.device_class === "temperature" || e.domain === "climate"
    );
    return this._filterByArea && this._targetAreaId && (t = t.filter((e) => e.area_id === this._targetAreaId)), t;
  }
  _toggleSet(t, e) {
    t.has(e) ? t.delete(e) : t.add(e), this.requestUpdate();
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
    const t = this._getEntityList(["climate", "switch"]), e = this._getEntityList(["climate"]);
    this._heaters.size > 0 && this._coolers.size > 0 && this._thermostats.clear();
    const i = this._getEntityList(["climate"]), r = this._getEntityList(["binary_sensor"]), n = this._getSensors();
    return u`
      <div class="dialog">
        <div class="dialog-header">
          <h2>Adopt Zone</h2>
          ${this._targetAreaId ? u`
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
      (o) => u`<option value="${o.id}">${o.name}</option>`
    )}
          </select>
        </div>

        <div class="field">
          <label>Temperature Sensor</label>
          <select
            @change=${(o) => this._temperatureSensor = o.target.value}
          >
            <option value="">Select Sensor</option>
            ${n.map(
      (o) => u`
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
            ${t.map(
      (o) => u`
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
            ${t.length === 0 ? u`<div style="color:var(--secondary-text-color)">
                  No heaters found in this area
                </div>` : ""}
          </div>
        </div>

        <div class="field">
          <label>Coolers</label>
          <div class="checkbox-list">
            ${e.map(
      (o) => u`
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
            ${e.length === 0 ? u`<div style="color:var(--secondary-text-color)">
                  No coolers found in this area
                </div>` : ""}
          </div>
        </div>

        ${this._heaters.size === 0 || this._coolers.size === 0 ? u`
              <div class="field">
                <label>Thermostats (Wall Dials)</label>
                <div class="checkbox-list">
                  ${i.map(
      (o) => u`
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
                  ${i.length === 0 ? u`<div style="color:var(--secondary-text-color)">
                        No thermostats found in this area
                      </div>` : ""}
                </div>
              </div>
            ` : ""}

        <div class="field">
          <label>Window Sensors</label>
          <div class="checkbox-list">
            ${r.map(
      (o) => u`
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
            ${r.length === 0 ? u`<div style="color:var(--secondary-text-color)">
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
or.styles = st`
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
let A = or;
R([
  S({ attribute: !1 })
], A.prototype, "hass");
R([
  S({ type: Boolean, reflect: !0 })
], A.prototype, "open");
R([
  S({ attribute: !1 })
], A.prototype, "entities");
R([
  S({ attribute: !1 })
], A.prototype, "preselected");
R([
  f()
], A.prototype, "_name");
R([
  f()
], A.prototype, "_temperatureSensor");
R([
  f()
], A.prototype, "_heaters");
R([
  f()
], A.prototype, "_thermostats");
R([
  f()
], A.prototype, "_coolers");
R([
  f()
], A.prototype, "_windowSensors");
R([
  f()
], A.prototype, "_roomType");
R([
  f()
], A.prototype, "_filterByArea");
R([
  f()
], A.prototype, "_targetAreaId");
R([
  f()
], A.prototype, "_targetAreaName");
R([
  f()
], A.prototype, "_circuits");
R([
  f()
], A.prototype, "_selectedCircuit");
customElements.get("adopt-dialog") || customElements.define("adopt-dialog", A);
var Oo = Object.defineProperty, B = (s, t, e, i) => {
  for (var r = void 0, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = o(t, e, r) || r);
  return r && Oo(t, e, r), r;
};
const nr = class nr extends I {
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
      } catch (t) {
        console.error("Failed to fetch circuits", t);
      }
  }
  async _deleteCircuit(t) {
    if (confirm("Delete this circuit?"))
      try {
        await this.hass.callWS({
          type: "climate_dashboard/circuit/delete",
          circuit_id: t
        }), this._fetchCircuits();
      } catch (e) {
        console.error(e), alert("Failed to delete: " + (e.message || e.code || JSON.stringify(e)));
      }
  }
  _openCircuitDialog(t) {
    t ? (this._editingCircuit = t, this._tempCircuitName = t.name, this._tempCircuitHeaters = [...t.heaters]) : (this._editingCircuit = null, this._tempCircuitName = "", this._tempCircuitHeaters = []), this._circuitDialogOpen = !0;
  }
  async _saveCircuit() {
    if (!this._tempCircuitName) return alert("Name required");
    const t = {
      name: this._tempCircuitName,
      heaters: this._tempCircuitHeaters
    };
    try {
      this._editingCircuit ? (t.type = "climate_dashboard/circuit/update", t.circuit_id = this._editingCircuit.id) : t.type = "climate_dashboard/circuit/create", await this.hass.callWS(t), this._circuitDialogOpen = !1, this._fetchCircuits();
    } catch (e) {
      console.error(e), alert("Error: " + (e.message || e.code || JSON.stringify(e)));
    }
  }
  async _fetchSettings() {
    if (this.hass)
      try {
        this._settings = await this.hass.callWS({
          type: "climate_dashboard/settings/get"
        });
      } catch (t) {
        console.error("Failed to fetch settings", t);
      }
  }
  async _fetchDevices() {
    if (this.hass) {
      this._loading = !0;
      try {
        this._devices = await this.hass.callWS({
          type: "climate_dashboard/scan"
        });
      } catch (t) {
        console.error("Failed to fetch devices", t);
      } finally {
        this._loading = !1;
      }
    }
  }
  render() {
    return u`
      <div class="card">
        <h2>System Settings</h2>
        <div class="settings-row">
          <label>Default Override Behavior</label>
          <select
            .value=${this._settings.default_override_type}
            @change=${(t) => this._updateSetting(
      "default_override_type",
      t.target.value
    )}
          >
            <option value="disabled">Disabled (Manual Not Respected)</option>
            <option value="next_block">Until Next Schedule</option>
            <option value="duration">Timer (Fixed Duration)</option>
          </select>
        </div>

        ${this._settings.default_override_type === "duration" ? u`
              <div class="settings-row">
                <label>Default Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="720"
                  step="5"
                  .value=${this._settings.default_timer_minutes}
                  @change=${(t) => this._updateSetting(
      "default_timer_minutes",
      parseInt(t.target.value)
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
            @change=${(t) => this._updateSetting(
      "window_open_delay_seconds",
      parseInt(t.target.value)
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
            @change=${(t) => this._updateSetting(
      "home_away_entity_id",
      t.target.value || null
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
            @change=${(t) => this._updateSetting(
      "away_delay_minutes",
      parseInt(t.target.value)
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
            @change=${(t) => this._updateSetting(
      "away_temperature",
      parseFloat(t.target.value)
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
            @change=${(t) => this._updateSetting(
      "away_temperature_cool",
      parseFloat(t.target.value)
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
        ${this._circuits.length === 0 ? u`<div class="empty">No circuits defined.</div>` : u`<div class="list">
              ${this._circuits.map(
      (t) => u`
                  <div class="circuit-item">
                    <div>
                      <strong>${t.name}</strong>
                      <div
                        style="font-size:0.8em; color:var(--secondary-text-color)"
                      >
                        Heaters: ${t.heaters.join(", ") || "None"}
                      </div>
                    </div>
                    <div class="circuit-actions">
                      <button
                        style="background:none; border:none; color:blue; cursor:pointer"
                        @click=${() => this._openCircuitDialog(t)}
                      >
                        Edit
                      </button>
                      <button
                        style="background:none; border:none; color:red; cursor:pointer"
                        @click=${() => this._deleteCircuit(t.id)}
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
          @input=${(t) => this._filterText = t.target.value}
        />
        ${this._loading ? u`<p>Scanning...</p>` : this._renderList()}
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
    const t = this._filterText.toLowerCase(), e = this._devices.filter((i) => {
      const r = ["climate", "switch"].includes(i.domain), n = !this._filterText || i.name.toLowerCase().includes(t) || i.entity_id.toLowerCase().includes(t) || i.area_name && i.area_name.toLowerCase().includes(t);
      return r && n;
    });
    return e.length === 0 ? u`<div class="empty">No unmanaged actuators found.</div>` : u`
      <div class="list">
        ${e.map(
      (i) => u`
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
                    ${i.area_name ? u`<span class="area-badge"
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
  _openDialog(t) {
    this._selectedEntity = t, this._dialogOpen = !0;
  }
  _closeDialog() {
    this._dialogOpen = !1, this._selectedEntity = null, this._fetchDevices();
  }
  async _updateSetting(t, e) {
    this._settings = { ...this._settings, [t]: e };
    try {
      await this.hass.callWS({
        type: "climate_dashboard/settings/update",
        [t]: e
      });
    } catch (i) {
      console.error("Failed to update settings", i), this._fetchSettings();
    }
  }
  _renderCircuitDialog() {
    if (!this._circuitDialogOpen) return u``;
    const t = this._devices.filter(
      (e) => ["switch", "climate"].includes(e.domain)
    );
    return u`
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
              @input=${(e) => this._tempCircuitName = e.target.value}
            />
          </div>

          <div style="margin-bottom:16px">
            <label style="display:block; margin-bottom:4px"
              >Shared Heaters (Boilers/Pumps)</label
            >
            <div
              style="max-height:150px; overflow-y:auto; border:1px solid #ccc; padding:8px; border-radius:4px"
            >
              ${t.map(
      (e) => u`
                  <div
                    style="display:flex; align-items:center; gap:8px; margin-bottom:4px"
                  >
                    <input
                      type="checkbox"
                      .checked=${this._tempCircuitHeaters.includes(e.entity_id)}
                      @change=${(i) => {
        i.target.checked ? this._tempCircuitHeaters = [
          ...this._tempCircuitHeaters,
          e.entity_id
        ] : this._tempCircuitHeaters = this._tempCircuitHeaters.filter(
          (r) => r !== e.entity_id
        );
      }}
                    />
                    <span>${e.name || e.entity_id}</span>
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
nr.styles = st`
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
let M = nr;
B([
  S({ attribute: !1 })
], M.prototype, "hass");
B([
  f()
], M.prototype, "_devices");
B([
  f()
], M.prototype, "_loading");
B([
  f()
], M.prototype, "_settings");
B([
  f()
], M.prototype, "_circuits");
B([
  f()
], M.prototype, "_circuitDialogOpen");
B([
  f()
], M.prototype, "_editingCircuit");
B([
  f()
], M.prototype, "_tempCircuitName");
B([
  f()
], M.prototype, "_tempCircuitHeaters");
B([
  f()
], M.prototype, "_dialogOpen");
B([
  f()
], M.prototype, "_selectedEntity");
B([
  f()
], M.prototype, "_filterText");
customElements.get("setup-view") || customElements.define("setup-view", M);
class le {
  /**
   * Groups zones by Floor -> Area.
   * Logic: Entity -> Area -> Floor.
   */
  static getGroupedZones(t, e) {
    if (!t) return [];
    let i = Object.values(t.states).filter(
      (a) => a.attributes.is_climate_dashboard_zone
    );
    if (e)
      return i = i.filter((a) => a.entity_id === e), [{ floorName: null, floorIcon: null, zones: i }];
    if (!t.floors || Object.keys(t.floors).length === 0)
      return i.length === 0 ? [] : [{ floorName: null, floorIcon: null, zones: i }];
    const r = {}, n = [];
    i.forEach((a) => {
      var m, _, v;
      const c = (m = t.entities) == null ? void 0 : m[a.entity_id], p = c == null ? void 0 : c.area_id, d = p ? (_ = t.areas) == null ? void 0 : _[p] : null, h = d == null ? void 0 : d.floor_id;
      if (h && ((v = t.floors) != null && v[h])) {
        const b = t.floors[h];
        if (!r[h]) {
          let O = b.icon;
          if (!O && b.level !== void 0 && b.level !== null) {
            const D = b.level;
            D === 0 ? O = "mdi:home-floor-0" : D > 0 ? O = `mdi:home-floor-${D}` : O = `mdi:home-floor-negative-${Math.abs(D)}`;
          }
          r[h] = {
            floorName: b.name,
            floorIcon: O,
            level: b.level,
            zones: []
          };
        }
        r[h].zones.push(a);
      } else
        n.push(a);
    });
    const l = Object.values(r).sort((a, c) => a.level !== null && c.level !== null ? c.level - a.level : a.floorName.localeCompare(c.floorName)).map((a) => ({
      floorName: a.floorName,
      floorIcon: a.floorIcon,
      zones: a.zones
    }));
    return n.length > 0 && l.push({
      floorName: "Other Devices",
      floorIcon: "mdi:devices",
      zones: n
    }), l;
  }
  /**
   * Processes schedule blocks for visualization.
   * Handles "Carry Over" logic (looking back at previous days to fill 00:00 gap).
   */
  static getTimelineBlocks(t, e) {
    const i = t.attributes.schedule || [], r = (t.attributes.heaters || []).length > 0, n = (t.attributes.coolers || []).length > 0;
    let o = "off";
    r && n ? o = "auto" : r ? o = "heat" : n && (o = "cool");
    const l = i.filter(
      (c) => c.days.includes(e)
    );
    if (l.sort(
      (c, p) => c.start_time.localeCompare(p.start_time)
    ), (l.length > 0 ? l[0].start_time : "24:00") > "00:00") {
      const c = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], p = c.indexOf(e);
      let d = null;
      for (let h = 1; h <= 7; h++) {
        const m = (p - h + 7) % 7, _ = c[m], v = i.filter(
          (b) => b.days.includes(_)
        );
        if (v.length > 0) {
          v.sort(
            (b, O) => b.start_time.localeCompare(O.start_time)
          ), d = v[v.length - 1];
          break;
        }
      }
      if (d) {
        const h = {
          ...d,
          start_time: "00:00",
          name: `Carry-over (${d.name})`
        };
        l.unshift(h);
      }
    }
    return l.map((c, p) => {
      const [d, h] = c.start_time.split(":").map(Number), m = d * 60 + h;
      let _ = 1440;
      if (p < l.length - 1) {
        const N = l[p + 1], [G, lt] = N.start_time.split(":").map(Number);
        _ = G * 60 + lt;
      }
      const v = _ - m, b = m / 1440 * 100, O = v / 1440 * 100;
      let D = "";
      const Z = c.temp_heat ?? 20, at = c.temp_cool ?? 24, j = 16, z = 24;
      let x = 1;
      if (o === "heat") {
        D = `${Z}°`;
        const N = (Z - j) / (z - j);
        x = 0.4 + 0.6 * Math.min(Math.max(N, 0), 1);
      } else if (o === "cool") {
        D = `${at}°`;
        const N = (at - j) / (z - j);
        x = 0.4 + 0.6 * Math.min(Math.max(N, 0), 1);
      } else if (o === "auto") {
        D = `${Z}-${at}°`;
        const N = (Z - j) / (z - j), G = 0.4 + 0.6 * Math.min(Math.max(N, 0), 1), lt = (at - j) / (z - j), V = 0.4 + 0.6 * Math.min(Math.max(lt, 0), 1);
        x = Math.max(G, V);
      } else
        D = `${Z}°`, x = 0.5;
      return {
        left: b,
        width: O,
        colorClass: `mode-${o}`,
        opacity: x,
        label: D,
        tooltip: `${c.name}: ${c.start_time} (${D})`
      };
    });
  }
  /**
   * Generates a rich status object for the Zone List.
   */
  static getZoneStatus(t, e) {
    const i = t.attributes;
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
    if (e)
      return {
        icon: "mdi:walk",
        color: "var(--warning-color, #ff9800)",
        text: "Away Mode Active",
        subtext: "Global Override"
      };
    if (i.active_intent_source === "occupancy_setback")
      return {
        icon: "mdi:leaf",
        color: "var(--success-color, #4caf50)",
        text: "Occupancy Setback",
        subtext: "Room Unoccupied"
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
      const r = new Date(i.next_scheduled_change).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      ), n = (i.heaters || []).length > 0, o = (i.coolers || []).length > 0;
      let l;
      return n && o && i.next_scheduled_temp_heat && i.next_scheduled_temp_cool ? l = u`<span
            style="color: var(--deep-orange-color, #ff5722)"
            >${i.next_scheduled_temp_heat}</span
          >-<span style="color: var(--blue-color, #2196f3)"
            >${i.next_scheduled_temp_cool}</span
          >°` : o && i.next_scheduled_temp_cool ? l = u`<span style="color: var(--blue-color, #2196f3)"
          >${i.next_scheduled_temp_cool}°</span
        >` : n && i.next_scheduled_temp_heat ? l = u`<span
          style="color: var(--deep-orange-color, #ff5722)"
          >${i.next_scheduled_temp_heat}°</span
        >` : l = u`--°`, {
        icon: "mdi:calendar-clock",
        color: "var(--secondary-text-color)",
        text: "Following Schedule",
        subtext: u`${l} at ${r}`
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
var Do = Object.defineProperty, Gi = (s, t, e, i) => {
  for (var r = void 0, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = o(t, e, r) || r);
  return r && Do(t, e, r), r;
};
const ar = class ar extends I {
  constructor() {
    super(...arguments), this._selectedDay = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
  }
  render() {
    try {
      if (!this.hass) return u``;
      const t = le.getGroupedZones(
        this.hass,
        this.focusZoneId
      ), e = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], i = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
      return u`
        <div class="card">
          <h2>Timeline</h2>

          <div class="day-selector">
            ${e.map(
        (r) => u`
                <button
                  class="day-tab ${this._selectedDay === r ? "active" : ""}"
                  @click=${() => this._selectedDay = r}
                >
                  ${r.toUpperCase()}
                </button>
              `
      )}
          </div>

          ${t.length === 0 ? u`<p>No zones adopted yet.</p>` : u`
                <div class="timeline-container">
                  <!-- Time Axis -->
                  <div class="time-axis">
                    <div class="time-axis-spacer"></div>
                    <div class="time-axis-track">
                      ${[0, 4, 8, 12, 16, 20, 24].map(
        (r) => u`
                          <div
                            class="time-marker"
                            style="left: ${r / 24 * 100}%"
                          >
                            ${r.toString().padStart(2, "0")}:00
                          </div>
                        `
      )}
                    </div>
                  </div>

                  <!-- Zones -->
                  ${t.map((r) => u`
                      ${r.floorName ? u`
                            <div class="floor-header">
                              <ha-icon
                                icon="${r.floorIcon || "mdi:home-floor-1"}"
                              ></ha-icon>
                              ${r.floorName}
                            </div>
                          ` : u``}
                      ${r.zones.map(
        (n) => this._renderZoneRow(n, this._selectedDay)
      )}
                    `)}

                  <!-- Current Time Indicator (Only show if viewing today) -->
                  ${this._selectedDay === i ? this._renderCurrentTimeLine() : ""}
                </div>
              `}
        </div>
      `;
    } catch (t) {
      return console.error("Error rendering TimelineView:", t), u`<div class="error">Error loading timeline</div>`;
    }
  }
  _renderZoneRow(t, e) {
    return u`
      <div class="zone-row" @click=${() => this._editSchedule(t.entity_id)}>
        <div class="zone-label">
          <div>${t.attributes.friendly_name || t.entity_id}</div>
          <div class="temp">
            ${t.attributes.current_temperature ?? "--"}°C ->
            ${t.attributes.temperature}°C
          </div>
        </div>

        <div class="timeline-track">${this._renderBlocks(t, e)}</div>
      </div>
    `;
  }
  _renderBlocks(t, e) {
    return le.getTimelineBlocks(t, e).map((r) => u`
        <div
          class="schedule-block ${r.colorClass}"
          style="left: ${r.left}%; width: ${r.width}%; --block-opacity: ${r.opacity.toFixed(
      2
    )};"
          title="${r.tooltip}"
        >
          ${r.label}
        </div>
      `);
  }
  _renderCurrentTimeLine() {
    const t = /* @__PURE__ */ new Date(), i = (t.getHours() * 60 + t.getMinutes()) / 1440 * 100;
    return u`
      <div
        class="current-time-line"
        style="left: calc(136px + (100% - 136px) * ${i / 100})"
      ></div>
    `;
  }
  _editSchedule(t) {
    this.dispatchEvent(
      new CustomEvent("schedule-selected", {
        detail: { entityId: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
ar.styles = st`
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
let Dt = ar;
Gi([
  S({ attribute: !1 })
], Dt.prototype, "hass");
Gi([
  S()
], Dt.prototype, "focusZoneId");
Gi([
  f()
], Dt.prototype, "_selectedDay");
customElements.get("timeline-view") || customElements.define("timeline-view", Dt);
var No = Object.defineProperty, Ps = (s, t, e, i) => {
  for (var r = void 0, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = o(t, e, r) || r);
  return r && No(t, e, r), r;
};
const lr = class lr extends I {
  constructor() {
    super(...arguments), this.isAwayMode = !1;
  }
  render() {
    try {
      const t = le.getGroupedZones(this.hass);
      return t.length === 0 ? u`
          <div class="empty">
            <p>No zones configured yet.</p>
            <p>Use the Setup button above to adopt devices.</p>
          </div>
        ` : u`
        <div class="grid">
          ${t.map((e) => u`
              ${e.floorName ? u`
                    <div class="floor-header">
                      <ha-icon
                        icon="${e.floorIcon || "mdi:home-floor-1"}"
                      ></ha-icon>
                      ${e.floorName}
                    </div>
                  ` : u`<div class="floor-header">
                    <ha-icon icon="mdi:devices"></ha-icon>Other Devices
                  </div>`}
              ${e.zones.map((i) => this._renderZoneCard(i))}
            `)}
        </div>
      `;
    } catch (t) {
      return console.error("Error rendering ZonesView:", t), u`<div class="error">Error loading zones</div>`;
    }
  }
  _renderZoneCard(t) {
    const e = t.attributes.hvac_action, i = t.attributes.current_temperature, r = le.getZoneStatus(t, this.isAwayMode);
    let n = r.icon, o = r.color;
    return (r.text === "Following Schedule" || r.text === "Unknown State") && (e === "heating" ? (n = "mdi:fire", o = "var(--deep-orange-color, #ff5722)") : e === "cooling" ? (n = "mdi:snowflake", o = "var(--blue-color, #2196f3)") : t.state === "heat" ? (n = "mdi:fire", o = "var(--primary-text-color)") : t.state === "cool" ? (n = "mdi:snowflake", o = "var(--primary-text-color)") : t.state === "off" && (n = "mdi:power-off", o = "var(--disabled-text-color)")), u`
      <div class="card" @click=${() => this._openDetails(t.entity_id)}>
        <button
          class="settings-btn"
          @click=${(l) => this._openSettings(l, t.entity_id)}
        >
          <ha-icon icon="mdi:cog"></ha-icon>
        </button>

        <div class="icon" style="color: ${o || "inherit"}">
          <ha-icon icon="${n}"></ha-icon>
        </div>
        <div class="name">
          ${t.attributes.friendly_name || t.entity_id}
        </div>
        <div class="temp">
          ${i != null ? `${i}°` : "--"}
        </div>

        <!-- Status Message -->
        <div class="status-msg" style="color: ${r.color}">
          ${r.text}
        </div>
        ${r.subtext ? u`<div
              class="status-msg"
              style="font-size: 0.7em; opacity: 0.8; color: ${r.color}"
            >
              ${r.subtext}
            </div>` : ""}

        <div class="actions">
          <button
            class="mode-btn ${t.state === "off" ? "active" : ""}"
            @click=${(l) => this._setMode(l, t.entity_id, "off")}
          >
            Off
          </button>

          <button
            class="mode-btn ${t.state === "auto" ? "active" : ""}"
            @click=${(l) => this._setMode(l, t.entity_id, "auto")}
          >
            Auto
          </button>
        </div>
      </div>
    `;
  }
  async _setMode(t, e, i) {
    t.stopPropagation(), await this.hass.callService("climate", "set_hvac_mode", {
      entity_id: e,
      hvac_mode: i
    });
  }
  _openDetails(t) {
    this.dispatchEvent(
      new CustomEvent("zone-details", {
        detail: { entityId: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _openSettings(t, e) {
    t.stopPropagation(), this.dispatchEvent(
      new CustomEvent("zone-settings", {
        detail: { entityId: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
lr.styles = st`
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
let ce = lr;
Ps([
  S({ attribute: !1 })
], ce.prototype, "hass");
Ps([
  S({ type: Boolean })
], ce.prototype, "isAwayMode");
customElements.get("zones-view") || customElements.define("zones-view", ce);
var wi = function(s, t) {
  return wi = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(e, i) {
    e.__proto__ = i;
  } || function(e, i) {
    for (var r in i) Object.prototype.hasOwnProperty.call(i, r) && (e[r] = i[r]);
  }, wi(s, t);
};
function Io(s, t) {
  if (typeof t != "function" && t !== null)
    throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
  wi(s, t);
  function e() {
    this.constructor = s;
  }
  s.prototype = t === null ? Object.create(t) : (e.prototype = t.prototype, new e());
}
var ie = function() {
  return ie = Object.assign || function(t) {
    for (var e, i = 1, r = arguments.length; i < r; i++) {
      e = arguments[i];
      for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    }
    return t;
  }, ie.apply(this, arguments);
};
function g(s, t, e, i) {
  var r = arguments.length, n = r < 3 ? t : i === null ? i = Object.getOwnPropertyDescriptor(t, e) : i, o;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") n = Reflect.decorate(s, t, e, i);
  else for (var l = s.length - 1; l >= 0; l--) (o = s[l]) && (n = (r < 3 ? o(n) : r > 3 ? o(t, e, n) : o(t, e)) || n);
  return r > 3 && n && Object.defineProperty(t, e, n), n;
}
function $e(s) {
  var t = typeof Symbol == "function" && Symbol.iterator, e = t && s[t], i = 0;
  if (e) return e.call(s);
  if (s && typeof s.length == "number") return {
    next: function() {
      return s && i >= s.length && (s = void 0), { value: s && s[i++], done: !s };
    }
  };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bo = (s) => (t) => typeof t == "function" ? ((e, i) => (customElements.define(e, i), i))(s, t) : ((e, i) => {
  const { kind: r, elements: n } = i;
  return { kind: r, elements: n, finisher(o) {
    customElements.define(e, o);
  } };
})(s, t);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Lo = (s, t) => t.kind === "method" && t.descriptor && !("value" in t.descriptor) ? { ...t, finisher(e) {
  e.createProperty(t.key, s);
} } : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: t.key, initializer() {
  typeof t.initializer == "function" && (this[t.key] = t.initializer.call(this));
}, finisher(e) {
  e.createProperty(t.key, s);
} }, jo = (s, t, e) => {
  t.constructor.createProperty(e, s);
};
function L(s) {
  return (t, e) => e !== void 0 ? jo(s, t, e) : Lo(s, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Fo(s) {
  return L({ ...s, state: !0 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Vi = ({ finisher: s, descriptor: t }) => (e, i) => {
  var r;
  if (i === void 0) {
    const n = (r = e.originalKey) !== null && r !== void 0 ? r : e.key, o = t != null ? { kind: "method", placement: "prototype", key: n, descriptor: t(e.key) } : { ...e, key: n };
    return s != null && (o.finisher = function(l) {
      s(l, n);
    }), o;
  }
  {
    const n = e.constructor;
    t !== void 0 && Object.defineProperty(e, i, t(i)), s == null || s(n, i);
  }
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Wo(s) {
  return Vi({ finisher: (t, e) => {
    Object.assign(t.prototype[e], s);
  } });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function qo(s, t) {
  return Vi({ descriptor: (e) => ({ get() {
    var r, n;
    return (n = (r = this.renderRoot) === null || r === void 0 ? void 0 : r.querySelector(s)) !== null && n !== void 0 ? n : null;
  }, enumerable: !0, configurable: !0 }) });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Zo(s) {
  return Vi({ descriptor: (t) => ({ async get() {
    var e;
    return await this.updateComplete, (e = this.renderRoot) === null || e === void 0 ? void 0 : e.querySelector(s);
  }, enumerable: !0, configurable: !0 }) });
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var Ke;
((Ke = window.HTMLSlotElement) === null || Ke === void 0 ? void 0 : Ke.prototype.assignedElements) != null;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Se = window, Ki = Se.ShadowRoot && (Se.ShadyCSS === void 0 || Se.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ji = Symbol(), Ar = /* @__PURE__ */ new WeakMap();
let Us = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== Ji) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Ki && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Ar.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Ar.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Go = (s) => new Us(typeof s == "string" ? s : s + "", void 0, Ji), Vo = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new Us(e, s, Ji);
}, Ko = (s, t) => {
  Ki ? s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet) : t.forEach((e) => {
    const i = document.createElement("style"), r = Se.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  });
}, Sr = Ki ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return Go(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var Je;
const Re = window, Cr = Re.trustedTypes, Jo = Cr ? Cr.emptyScript : "", Er = Re.reactiveElementPolyfillSupport, Ai = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Jo : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, Rs = (s, t) => t !== s && (t == t || s == s), Xe = { attribute: !0, type: String, converter: Ai, reflect: !1, hasChanged: Rs }, Si = "finalized";
let Ut = class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
  }
  static addInitializer(t) {
    var e;
    this.finalize(), ((e = this.h) !== null && e !== void 0 ? e : this.h = []).push(t);
  }
  static get observedAttributes() {
    this.finalize();
    const t = [];
    return this.elementProperties.forEach((e, i) => {
      const r = this._$Ep(i, e);
      r !== void 0 && (this._$Ev.set(r, i), t.push(r));
    }), t;
  }
  static createProperty(t, e = Xe) {
    if (e.state && (e.attribute = !1), this.finalize(), this.elementProperties.set(t, e), !e.noAccessor && !this.prototype.hasOwnProperty(t)) {
      const i = typeof t == "symbol" ? Symbol() : "__" + t, r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && Object.defineProperty(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    return { get() {
      return this[e];
    }, set(r) {
      const n = this[t];
      this[e] = r, this.requestUpdate(t, n, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) || Xe;
  }
  static finalize() {
    if (this.hasOwnProperty(Si)) return !1;
    this[Si] = !0;
    const t = Object.getPrototypeOf(this);
    if (t.finalize(), t.h !== void 0 && (this.h = [...t.h]), this.elementProperties = new Map(t.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const e = this.properties, i = [...Object.getOwnPropertyNames(e), ...Object.getOwnPropertySymbols(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), !0;
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(Sr(r));
    } else t !== void 0 && e.push(Sr(t));
    return e;
  }
  static _$Ep(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  _$Eu() {
    var t;
    this._$E_ = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), (t = this.constructor.h) === null || t === void 0 || t.forEach((e) => e(this));
  }
  addController(t) {
    var e, i;
    ((e = this._$ES) !== null && e !== void 0 ? e : this._$ES = []).push(t), this.renderRoot !== void 0 && this.isConnected && ((i = t.hostConnected) === null || i === void 0 || i.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.splice(this._$ES.indexOf(t) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((t, e) => {
      this.hasOwnProperty(e) && (this._$Ei.set(e, this[e]), delete this[e]);
    });
  }
  createRenderRoot() {
    var t;
    const e = (t = this.shadowRoot) !== null && t !== void 0 ? t : this.attachShadow(this.constructor.shadowRootOptions);
    return Ko(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var t;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) === null || i === void 0 ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) === null || i === void 0 ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$EO(t, e, i = Xe) {
    var r;
    const n = this.constructor._$Ep(t, i);
    if (n !== void 0 && i.reflect === !0) {
      const o = (((r = i.converter) === null || r === void 0 ? void 0 : r.toAttribute) !== void 0 ? i.converter : Ai).toAttribute(e, i.type);
      this._$El = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$El = null;
    }
  }
  _$AK(t, e) {
    var i;
    const r = this.constructor, n = r._$Ev.get(t);
    if (n !== void 0 && this._$El !== n) {
      const o = r.getPropertyOptions(n), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((i = o.converter) === null || i === void 0 ? void 0 : i.fromAttribute) !== void 0 ? o.converter : Ai;
      this._$El = n, this[n] = l.fromAttribute(e, o.type), this._$El = null;
    }
  }
  requestUpdate(t, e, i) {
    let r = !0;
    t !== void 0 && (((i = i || this.constructor.getPropertyOptions(t)).hasChanged || Rs)(this[t], e) ? (this._$AL.has(t) || this._$AL.set(t, e), i.reflect === !0 && this._$El !== t && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t, i))) : r = !1), !this.isUpdatePending && r && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = !0;
    try {
      await this._$E_;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t;
    if (!this.isUpdatePending) return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((r, n) => this[n] = r), this._$Ei = void 0);
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), (t = this._$ES) === null || t === void 0 || t.forEach((r) => {
        var n;
        return (n = r.hostUpdate) === null || n === void 0 ? void 0 : n.call(r);
      }), this.update(i)) : this._$Ek();
    } catch (r) {
      throw e = !1, this._$Ek(), r;
    }
    e && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.forEach((i) => {
      var r;
      return (r = i.hostUpdated) === null || r === void 0 ? void 0 : r.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$Ek() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$EC !== void 0 && (this._$EC.forEach((e, i) => this._$EO(i, this[i], e)), this._$EC = void 0), this._$Ek();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
Ut[Si] = !0, Ut.elementProperties = /* @__PURE__ */ new Map(), Ut.elementStyles = [], Ut.shadowRootOptions = { mode: "open" }, Er == null || Er({ ReactiveElement: Ut }), ((Je = Re.reactiveElementVersions) !== null && Je !== void 0 ? Je : Re.reactiveElementVersions = []).push("1.6.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var Qe;
const ze = window, Nt = ze.trustedTypes, kr = Nt ? Nt.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Ci = "$lit$", X = `lit$${(Math.random() + "").slice(9)}$`, zs = "?" + X, Xo = `<${zs}>`, wt = document, de = () => wt.createComment(""), pe = (s) => s === null || typeof s != "object" && typeof s != "function", Ms = Array.isArray, Qo = (s) => Ms(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", Ye = `[ 	
\f\r]`, Jt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Hr = /-->/g, Pr = />/g, ht = RegExp(`>|${Ye}(?:([^\\s"'>=/]+)(${Ye}*=${Ye}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ur = /'/g, Rr = /"/g, Ts = /^(?:script|style|textarea|title)$/i, Yo = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), tn = Yo(1), It = Symbol.for("lit-noChange"), k = Symbol.for("lit-nothing"), zr = /* @__PURE__ */ new WeakMap(), gt = wt.createTreeWalker(wt, 129, null, !1);
function Os(s, t) {
  if (!Array.isArray(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return kr !== void 0 ? kr.createHTML(t) : t;
}
const en = (s, t) => {
  const e = s.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : "", o = Jt;
  for (let l = 0; l < e; l++) {
    const a = s[l];
    let c, p, d = -1, h = 0;
    for (; h < a.length && (o.lastIndex = h, p = o.exec(a), p !== null); ) h = o.lastIndex, o === Jt ? p[1] === "!--" ? o = Hr : p[1] !== void 0 ? o = Pr : p[2] !== void 0 ? (Ts.test(p[2]) && (r = RegExp("</" + p[2], "g")), o = ht) : p[3] !== void 0 && (o = ht) : o === ht ? p[0] === ">" ? (o = r ?? Jt, d = -1) : p[1] === void 0 ? d = -2 : (d = o.lastIndex - p[2].length, c = p[1], o = p[3] === void 0 ? ht : p[3] === '"' ? Rr : Ur) : o === Rr || o === Ur ? o = ht : o === Hr || o === Pr ? o = Jt : (o = ht, r = void 0);
    const m = o === ht && s[l + 1].startsWith("/>") ? " " : "";
    n += o === Jt ? a + Xo : d >= 0 ? (i.push(c), a.slice(0, d) + Ci + a.slice(d) + X + m) : a + X + (d === -2 ? (i.push(void 0), l) : m);
  }
  return [Os(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : "")), i];
};
let Ei = class Ds {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, a = this.parts, [c, p] = en(t, e);
    if (this.el = Ds.createElement(c, i), gt.currentNode = this.el.content, e === 2) {
      const d = this.el.content, h = d.firstChild;
      h.remove(), d.append(...h.childNodes);
    }
    for (; (r = gt.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) {
          const d = [];
          for (const h of r.getAttributeNames()) if (h.endsWith(Ci) || h.startsWith(X)) {
            const m = p[o++];
            if (d.push(h), m !== void 0) {
              const _ = r.getAttribute(m.toLowerCase() + Ci).split(X), v = /([.?@])?(.*)/.exec(m);
              a.push({ type: 1, index: n, name: v[2], strings: _, ctor: v[1] === "." ? sn : v[1] === "?" ? nn : v[1] === "@" ? an : Le });
            } else a.push({ type: 6, index: n });
          }
          for (const h of d) r.removeAttribute(h);
        }
        if (Ts.test(r.tagName)) {
          const d = r.textContent.split(X), h = d.length - 1;
          if (h > 0) {
            r.textContent = Nt ? Nt.emptyScript : "";
            for (let m = 0; m < h; m++) r.append(d[m], de()), gt.nextNode(), a.push({ type: 2, index: ++n });
            r.append(d[h], de());
          }
        }
      } else if (r.nodeType === 8) if (r.data === zs) a.push({ type: 2, index: n });
      else {
        let d = -1;
        for (; (d = r.data.indexOf(X, d + 1)) !== -1; ) a.push({ type: 7, index: n }), d += X.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = wt.createElement("template");
    return i.innerHTML = t, i;
  }
};
function Bt(s, t, e = s, i) {
  var r, n, o, l;
  if (t === It) return t;
  let a = i !== void 0 ? (r = e._$Co) === null || r === void 0 ? void 0 : r[i] : e._$Cl;
  const c = pe(t) ? void 0 : t._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== c && ((n = a == null ? void 0 : a._$AO) === null || n === void 0 || n.call(a, !1), c === void 0 ? a = void 0 : (a = new c(s), a._$AT(s, e, i)), i !== void 0 ? ((o = (l = e)._$Co) !== null && o !== void 0 ? o : l._$Co = [])[i] = a : e._$Cl = a), a !== void 0 && (t = Bt(s, a._$AS(s, t.values), a, i)), t;
}
let rn = class {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    var e;
    const { el: { content: i }, parts: r } = this._$AD, n = ((e = t == null ? void 0 : t.creationScope) !== null && e !== void 0 ? e : wt).importNode(i, !0);
    gt.currentNode = n;
    let o = gt.nextNode(), l = 0, a = 0, c = r[0];
    for (; c !== void 0; ) {
      if (l === c.index) {
        let p;
        c.type === 2 ? p = new Xi(o, o.nextSibling, this, t) : c.type === 1 ? p = new c.ctor(o, c.name, c.strings, this, t) : c.type === 6 && (p = new ln(o, this, t)), this._$AV.push(p), c = r[++a];
      }
      l !== (c == null ? void 0 : c.index) && (o = gt.nextNode(), l++);
    }
    return gt.currentNode = wt, n;
  }
  v(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}, Xi = class Ns {
  constructor(t, e, i, r) {
    var n;
    this.type = 2, this._$AH = k, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cp = (n = r == null ? void 0 : r.isConnected) === null || n === void 0 || n;
  }
  get _$AU() {
    var t, e;
    return (e = (t = this._$AM) === null || t === void 0 ? void 0 : t._$AU) !== null && e !== void 0 ? e : this._$Cp;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = Bt(this, t, e), pe(t) ? t === k || t == null || t === "" ? (this._$AH !== k && this._$AR(), this._$AH = k) : t !== this._$AH && t !== It && this._(t) : t._$litType$ !== void 0 ? this.g(t) : t.nodeType !== void 0 ? this.$(t) : Qo(t) ? this.T(t) : this._(t);
  }
  k(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  $(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.k(t));
  }
  _(t) {
    this._$AH !== k && pe(this._$AH) ? this._$AA.nextSibling.data = t : this.$(wt.createTextNode(t)), this._$AH = t;
  }
  g(t) {
    var e;
    const { values: i, _$litType$: r } = t, n = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = Ei.createElement(Os(r.h, r.h[0]), this.options)), r);
    if (((e = this._$AH) === null || e === void 0 ? void 0 : e._$AD) === n) this._$AH.v(i);
    else {
      const o = new rn(n, this), l = o.u(this.options);
      o.v(i), this.$(l), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = zr.get(t.strings);
    return e === void 0 && zr.set(t.strings, e = new Ei(t)), e;
  }
  T(t) {
    Ms(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const n of t) r === e.length ? e.push(i = new Ns(this.k(de()), this.k(de()), this, this.options)) : i = e[r], i._$AI(n), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, !1, !0, e); t && t !== this._$AB; ) {
      const r = t.nextSibling;
      t.remove(), t = r;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cp = t, (e = this._$AP) === null || e === void 0 || e.call(this, t));
  }
}, Le = class {
  constructor(t, e, i, r, n) {
    this.type = 1, this._$AH = k, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = k;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t, e = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = Bt(this, t, e, 0), o = !pe(t) || t !== this._$AH && t !== It, o && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = n[0], a = 0; a < n.length - 1; a++) c = Bt(this, l[i + a], e, a), c === It && (c = this._$AH[a]), o || (o = !pe(c) || c !== this._$AH[a]), c === k ? t = k : t !== k && (t += (c ?? "") + n[a + 1]), this._$AH[a] = c;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === k ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}, sn = class extends Le {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === k ? void 0 : t;
  }
};
const on = Nt ? Nt.emptyScript : "";
let nn = class extends Le {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    t && t !== k ? this.element.setAttribute(this.name, on) : this.element.removeAttribute(this.name);
  }
}, an = class extends Le {
  constructor(t, e, i, r, n) {
    super(t, e, i, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    var i;
    if ((t = (i = Bt(this, t, e, 0)) !== null && i !== void 0 ? i : k) === It) return;
    const r = this._$AH, n = t === k && r !== k || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, o = t !== k && (r === k || n);
    n && this.element.removeEventListener(this.name, this, r), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (e = this.options) === null || e === void 0 ? void 0 : e.host) !== null && i !== void 0 ? i : this.element, t) : this._$AH.handleEvent(t);
  }
}, ln = class {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Bt(this, t);
  }
};
const Mr = ze.litHtmlPolyfillSupport;
Mr == null || Mr(Ei, Xi), ((Qe = ze.litHtmlVersions) !== null && Qe !== void 0 ? Qe : ze.litHtmlVersions = []).push("2.8.0");
const cn = (s, t, e) => {
  var i, r;
  const n = (i = e == null ? void 0 : e.renderBefore) !== null && i !== void 0 ? i : t;
  let o = n._$litPart$;
  if (o === void 0) {
    const l = (r = e == null ? void 0 : e.renderBefore) !== null && r !== void 0 ? r : null;
    n._$litPart$ = o = new Xi(t.insertBefore(de(), l), l, void 0, e ?? {});
  }
  return o._$AI(s), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var ti, ei;
let re = class extends Ut {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t, e;
    const i = super.createRenderRoot();
    return (t = (e = this.renderOptions).renderBefore) !== null && t !== void 0 || (e.renderBefore = i.firstChild), i;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = cn(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!1);
  }
  render() {
    return It;
  }
};
re.finalized = !0, re._$litElement$ = !0, (ti = globalThis.litElementHydrateSupport) === null || ti === void 0 || ti.call(globalThis, { LitElement: re });
const Tr = globalThis.litElementPolyfillSupport;
Tr == null || Tr({ LitElement: re });
((ei = globalThis.litElementVersions) !== null && ei !== void 0 ? ei : globalThis.litElementVersions = []).push("3.3.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dn = (s) => (t) => typeof t == "function" ? ((e, i) => (customElements.define(e, i), i))(s, t) : ((e, i) => {
  const { kind: r, elements: n } = i;
  return { kind: r, elements: n, finisher(o) {
    customElements.define(e, o);
  } };
})(s, t);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var ii;
((ii = window.HTMLSlotElement) === null || ii === void 0 ? void 0 : ii.prototype.assignedElements) != null;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-LIcense-Identifier: Apache-2.0
 */
const pn = Vo`:host{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}`;
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let ki = class extends re {
  /** @soyTemplate */
  render() {
    return tn`<span><slot></slot></span>`;
  }
};
ki.styles = [pn];
ki = g([
  dn("mwc-icon")
], ki);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const hn = (s) => (t) => typeof t == "function" ? ((e, i) => (customElements.define(e, i), i))(s, t) : ((e, i) => {
  const { kind: r, elements: n } = i;
  return { kind: r, elements: n, finisher(o) {
    customElements.define(e, o);
  } };
})(s, t);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const un = (s, t) => t.kind === "method" && t.descriptor && !("value" in t.descriptor) ? { ...t, finisher(e) {
  e.createProperty(t.key, s);
} } : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: t.key, initializer() {
  typeof t.initializer == "function" && (this[t.key] = t.initializer.call(this));
}, finisher(e) {
  e.createProperty(t.key, s);
} }, mn = (s, t, e) => {
  t.constructor.createProperty(e, s);
};
function ot(s) {
  return (t, e) => e !== void 0 ? mn(s, t, e) : un(s, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function W(s) {
  return ot({ ...s, state: !0 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fn = ({ finisher: s, descriptor: t }) => (e, i) => {
  var r;
  if (i === void 0) {
    const n = (r = e.originalKey) !== null && r !== void 0 ? r : e.key, o = t != null ? { kind: "method", placement: "prototype", key: n, descriptor: t(e.key) } : { ...e, key: n };
    return s != null && (o.finisher = function(l) {
      s(l, n);
    }), o;
  }
  {
    const n = e.constructor;
    t !== void 0 && Object.defineProperty(e, i, t(i)), s == null || s(n, i);
  }
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function vn(s, t) {
  return fn({ descriptor: (e) => ({ get() {
    var r, n;
    return (n = (r = this.renderRoot) === null || r === void 0 ? void 0 : r.querySelector(s)) !== null && n !== void 0 ? n : null;
  }, enumerable: !0, configurable: !0 }) });
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var ri;
((ri = window.HTMLSlotElement) === null || ri === void 0 ? void 0 : ri.prototype.assignedElements) != null;
/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
function gn(s, t) {
  var e = s.matches || s.webkitMatchesSelector || s.msMatchesSelector;
  return e.call(s, t);
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ce = window, Qi = Ce.ShadowRoot && (Ce.ShadyCSS === void 0 || Ce.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Is = Symbol(), Or = /* @__PURE__ */ new WeakMap();
let _n = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== Is) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Qi && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Or.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Or.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const yn = (s) => new _n(typeof s == "string" ? s : s + "", void 0, Is), bn = (s, t) => {
  Qi ? s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet) : t.forEach((e) => {
    const i = document.createElement("style"), r = Ce.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  });
}, Dr = Qi ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return yn(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var si;
const Me = window, Nr = Me.trustedTypes, $n = Nr ? Nr.emptyScript : "", Ir = Me.reactiveElementPolyfillSupport, Hi = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? $n : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, Bs = (s, t) => t !== s && (t == t || s == s), oi = { attribute: !0, type: String, converter: Hi, reflect: !1, hasChanged: Bs }, Pi = "finalized";
let Rt = class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
  }
  static addInitializer(t) {
    var e;
    this.finalize(), ((e = this.h) !== null && e !== void 0 ? e : this.h = []).push(t);
  }
  static get observedAttributes() {
    this.finalize();
    const t = [];
    return this.elementProperties.forEach((e, i) => {
      const r = this._$Ep(i, e);
      r !== void 0 && (this._$Ev.set(r, i), t.push(r));
    }), t;
  }
  static createProperty(t, e = oi) {
    if (e.state && (e.attribute = !1), this.finalize(), this.elementProperties.set(t, e), !e.noAccessor && !this.prototype.hasOwnProperty(t)) {
      const i = typeof t == "symbol" ? Symbol() : "__" + t, r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && Object.defineProperty(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    return { get() {
      return this[e];
    }, set(r) {
      const n = this[t];
      this[e] = r, this.requestUpdate(t, n, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) || oi;
  }
  static finalize() {
    if (this.hasOwnProperty(Pi)) return !1;
    this[Pi] = !0;
    const t = Object.getPrototypeOf(this);
    if (t.finalize(), t.h !== void 0 && (this.h = [...t.h]), this.elementProperties = new Map(t.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const e = this.properties, i = [...Object.getOwnPropertyNames(e), ...Object.getOwnPropertySymbols(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), !0;
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(Dr(r));
    } else t !== void 0 && e.push(Dr(t));
    return e;
  }
  static _$Ep(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  _$Eu() {
    var t;
    this._$E_ = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), (t = this.constructor.h) === null || t === void 0 || t.forEach((e) => e(this));
  }
  addController(t) {
    var e, i;
    ((e = this._$ES) !== null && e !== void 0 ? e : this._$ES = []).push(t), this.renderRoot !== void 0 && this.isConnected && ((i = t.hostConnected) === null || i === void 0 || i.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.splice(this._$ES.indexOf(t) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((t, e) => {
      this.hasOwnProperty(e) && (this._$Ei.set(e, this[e]), delete this[e]);
    });
  }
  createRenderRoot() {
    var t;
    const e = (t = this.shadowRoot) !== null && t !== void 0 ? t : this.attachShadow(this.constructor.shadowRootOptions);
    return bn(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var t;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) === null || i === void 0 ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) === null || i === void 0 ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$EO(t, e, i = oi) {
    var r;
    const n = this.constructor._$Ep(t, i);
    if (n !== void 0 && i.reflect === !0) {
      const o = (((r = i.converter) === null || r === void 0 ? void 0 : r.toAttribute) !== void 0 ? i.converter : Hi).toAttribute(e, i.type);
      this._$El = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$El = null;
    }
  }
  _$AK(t, e) {
    var i;
    const r = this.constructor, n = r._$Ev.get(t);
    if (n !== void 0 && this._$El !== n) {
      const o = r.getPropertyOptions(n), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((i = o.converter) === null || i === void 0 ? void 0 : i.fromAttribute) !== void 0 ? o.converter : Hi;
      this._$El = n, this[n] = l.fromAttribute(e, o.type), this._$El = null;
    }
  }
  requestUpdate(t, e, i) {
    let r = !0;
    t !== void 0 && (((i = i || this.constructor.getPropertyOptions(t)).hasChanged || Bs)(this[t], e) ? (this._$AL.has(t) || this._$AL.set(t, e), i.reflect === !0 && this._$El !== t && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t, i))) : r = !1), !this.isUpdatePending && r && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = !0;
    try {
      await this._$E_;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t;
    if (!this.isUpdatePending) return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((r, n) => this[n] = r), this._$Ei = void 0);
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), (t = this._$ES) === null || t === void 0 || t.forEach((r) => {
        var n;
        return (n = r.hostUpdate) === null || n === void 0 ? void 0 : n.call(r);
      }), this.update(i)) : this._$Ek();
    } catch (r) {
      throw e = !1, this._$Ek(), r;
    }
    e && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.forEach((i) => {
      var r;
      return (r = i.hostUpdated) === null || r === void 0 ? void 0 : r.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$Ek() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$EC !== void 0 && (this._$EC.forEach((e, i) => this._$EO(i, this[i], e)), this._$EC = void 0), this._$Ek();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
Rt[Pi] = !0, Rt.elementProperties = /* @__PURE__ */ new Map(), Rt.elementStyles = [], Rt.shadowRootOptions = { mode: "open" }, Ir == null || Ir({ ReactiveElement: Rt }), ((si = Me.reactiveElementVersions) !== null && si !== void 0 ? si : Me.reactiveElementVersions = []).push("1.6.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var ni;
const Te = window, Lt = Te.trustedTypes, Br = Lt ? Lt.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Ui = "$lit$", Q = `lit$${(Math.random() + "").slice(9)}$`, Ls = "?" + Q, xn = `<${Ls}>`, At = document, he = () => At.createComment(""), ue = (s) => s === null || typeof s != "object" && typeof s != "function", js = Array.isArray, wn = (s) => js(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", ai = `[ 	
\f\r]`, Xt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Lr = /-->/g, jr = />/g, ut = RegExp(`>|${ai}(?:([^\\s"'>=/]+)(${ai}*=${ai}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Fr = /'/g, Wr = /"/g, Fs = /^(?:script|style|textarea|title)$/i, jt = Symbol.for("lit-noChange"), H = Symbol.for("lit-nothing"), qr = /* @__PURE__ */ new WeakMap(), _t = At.createTreeWalker(At, 129, null, !1);
function Ws(s, t) {
  if (!Array.isArray(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Br !== void 0 ? Br.createHTML(t) : t;
}
const An = (s, t) => {
  const e = s.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : "", o = Xt;
  for (let l = 0; l < e; l++) {
    const a = s[l];
    let c, p, d = -1, h = 0;
    for (; h < a.length && (o.lastIndex = h, p = o.exec(a), p !== null); ) h = o.lastIndex, o === Xt ? p[1] === "!--" ? o = Lr : p[1] !== void 0 ? o = jr : p[2] !== void 0 ? (Fs.test(p[2]) && (r = RegExp("</" + p[2], "g")), o = ut) : p[3] !== void 0 && (o = ut) : o === ut ? p[0] === ">" ? (o = r ?? Xt, d = -1) : p[1] === void 0 ? d = -2 : (d = o.lastIndex - p[2].length, c = p[1], o = p[3] === void 0 ? ut : p[3] === '"' ? Wr : Fr) : o === Wr || o === Fr ? o = ut : o === Lr || o === jr ? o = Xt : (o = ut, r = void 0);
    const m = o === ut && s[l + 1].startsWith("/>") ? " " : "";
    n += o === Xt ? a + xn : d >= 0 ? (i.push(c), a.slice(0, d) + Ui + a.slice(d) + Q + m) : a + Q + (d === -2 ? (i.push(void 0), l) : m);
  }
  return [Ws(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : "")), i];
};
let Ri = class qs {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, a = this.parts, [c, p] = An(t, e);
    if (this.el = qs.createElement(c, i), _t.currentNode = this.el.content, e === 2) {
      const d = this.el.content, h = d.firstChild;
      h.remove(), d.append(...h.childNodes);
    }
    for (; (r = _t.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) {
          const d = [];
          for (const h of r.getAttributeNames()) if (h.endsWith(Ui) || h.startsWith(Q)) {
            const m = p[o++];
            if (d.push(h), m !== void 0) {
              const _ = r.getAttribute(m.toLowerCase() + Ui).split(Q), v = /([.?@])?(.*)/.exec(m);
              a.push({ type: 1, index: n, name: v[2], strings: _, ctor: v[1] === "." ? Cn : v[1] === "?" ? kn : v[1] === "@" ? Hn : je });
            } else a.push({ type: 6, index: n });
          }
          for (const h of d) r.removeAttribute(h);
        }
        if (Fs.test(r.tagName)) {
          const d = r.textContent.split(Q), h = d.length - 1;
          if (h > 0) {
            r.textContent = Lt ? Lt.emptyScript : "";
            for (let m = 0; m < h; m++) r.append(d[m], he()), _t.nextNode(), a.push({ type: 2, index: ++n });
            r.append(d[h], he());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Ls) a.push({ type: 2, index: n });
      else {
        let d = -1;
        for (; (d = r.data.indexOf(Q, d + 1)) !== -1; ) a.push({ type: 7, index: n }), d += Q.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = At.createElement("template");
    return i.innerHTML = t, i;
  }
};
function Ft(s, t, e = s, i) {
  var r, n, o, l;
  if (t === jt) return t;
  let a = i !== void 0 ? (r = e._$Co) === null || r === void 0 ? void 0 : r[i] : e._$Cl;
  const c = ue(t) ? void 0 : t._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== c && ((n = a == null ? void 0 : a._$AO) === null || n === void 0 || n.call(a, !1), c === void 0 ? a = void 0 : (a = new c(s), a._$AT(s, e, i)), i !== void 0 ? ((o = (l = e)._$Co) !== null && o !== void 0 ? o : l._$Co = [])[i] = a : e._$Cl = a), a !== void 0 && (t = Ft(s, a._$AS(s, t.values), a, i)), t;
}
let Sn = class {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    var e;
    const { el: { content: i }, parts: r } = this._$AD, n = ((e = t == null ? void 0 : t.creationScope) !== null && e !== void 0 ? e : At).importNode(i, !0);
    _t.currentNode = n;
    let o = _t.nextNode(), l = 0, a = 0, c = r[0];
    for (; c !== void 0; ) {
      if (l === c.index) {
        let p;
        c.type === 2 ? p = new Yi(o, o.nextSibling, this, t) : c.type === 1 ? p = new c.ctor(o, c.name, c.strings, this, t) : c.type === 6 && (p = new Pn(o, this, t)), this._$AV.push(p), c = r[++a];
      }
      l !== (c == null ? void 0 : c.index) && (o = _t.nextNode(), l++);
    }
    return _t.currentNode = At, n;
  }
  v(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}, Yi = class Zs {
  constructor(t, e, i, r) {
    var n;
    this.type = 2, this._$AH = H, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cp = (n = r == null ? void 0 : r.isConnected) === null || n === void 0 || n;
  }
  get _$AU() {
    var t, e;
    return (e = (t = this._$AM) === null || t === void 0 ? void 0 : t._$AU) !== null && e !== void 0 ? e : this._$Cp;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = Ft(this, t, e), ue(t) ? t === H || t == null || t === "" ? (this._$AH !== H && this._$AR(), this._$AH = H) : t !== this._$AH && t !== jt && this._(t) : t._$litType$ !== void 0 ? this.g(t) : t.nodeType !== void 0 ? this.$(t) : wn(t) ? this.T(t) : this._(t);
  }
  k(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  $(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.k(t));
  }
  _(t) {
    this._$AH !== H && ue(this._$AH) ? this._$AA.nextSibling.data = t : this.$(At.createTextNode(t)), this._$AH = t;
  }
  g(t) {
    var e;
    const { values: i, _$litType$: r } = t, n = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = Ri.createElement(Ws(r.h, r.h[0]), this.options)), r);
    if (((e = this._$AH) === null || e === void 0 ? void 0 : e._$AD) === n) this._$AH.v(i);
    else {
      const o = new Sn(n, this), l = o.u(this.options);
      o.v(i), this.$(l), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = qr.get(t.strings);
    return e === void 0 && qr.set(t.strings, e = new Ri(t)), e;
  }
  T(t) {
    js(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const n of t) r === e.length ? e.push(i = new Zs(this.k(he()), this.k(he()), this, this.options)) : i = e[r], i._$AI(n), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, !1, !0, e); t && t !== this._$AB; ) {
      const r = t.nextSibling;
      t.remove(), t = r;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cp = t, (e = this._$AP) === null || e === void 0 || e.call(this, t));
  }
}, je = class {
  constructor(t, e, i, r, n) {
    this.type = 1, this._$AH = H, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = H;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t, e = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = Ft(this, t, e, 0), o = !ue(t) || t !== this._$AH && t !== jt, o && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = n[0], a = 0; a < n.length - 1; a++) c = Ft(this, l[i + a], e, a), c === jt && (c = this._$AH[a]), o || (o = !ue(c) || c !== this._$AH[a]), c === H ? t = H : t !== H && (t += (c ?? "") + n[a + 1]), this._$AH[a] = c;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === H ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}, Cn = class extends je {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === H ? void 0 : t;
  }
};
const En = Lt ? Lt.emptyScript : "";
let kn = class extends je {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    t && t !== H ? this.element.setAttribute(this.name, En) : this.element.removeAttribute(this.name);
  }
}, Hn = class extends je {
  constructor(t, e, i, r, n) {
    super(t, e, i, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    var i;
    if ((t = (i = Ft(this, t, e, 0)) !== null && i !== void 0 ? i : H) === jt) return;
    const r = this._$AH, n = t === H && r !== H || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, o = t !== H && (r === H || n);
    n && this.element.removeEventListener(this.name, this, r), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (e = this.options) === null || e === void 0 ? void 0 : e.host) !== null && i !== void 0 ? i : this.element, t) : this._$AH.handleEvent(t);
  }
}, Pn = class {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Ft(this, t);
  }
};
const Zr = Te.litHtmlPolyfillSupport;
Zr == null || Zr(Ri, Yi), ((ni = Te.litHtmlVersions) !== null && ni !== void 0 ? ni : Te.litHtmlVersions = []).push("2.8.0");
const Un = (s, t, e) => {
  var i, r;
  const n = (i = e == null ? void 0 : e.renderBefore) !== null && i !== void 0 ? i : t;
  let o = n._$litPart$;
  if (o === void 0) {
    const l = (r = e == null ? void 0 : e.renderBefore) !== null && r !== void 0 ? r : null;
    n._$litPart$ = o = new Yi(t.insertBefore(he(), l), l, void 0, e ?? {});
  }
  return o._$AI(s), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var li, ci;
let se = class extends Rt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t, e;
    const i = super.createRenderRoot();
    return (t = (e = this.renderOptions).renderBefore) !== null && t !== void 0 || (e.renderBefore = i.firstChild), i;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Un(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!1);
  }
  render() {
    return jt;
  }
};
se.finalized = !0, se._$litElement$ = !0, (li = globalThis.litElementHydrateSupport) === null || li === void 0 || li.call(globalThis, { LitElement: se });
const Gr = globalThis.litElementPolyfillSupport;
Gr == null || Gr({ LitElement: se });
((ci = globalThis.litElementVersions) !== null && ci !== void 0 ? ci : globalThis.litElementVersions = []).push("3.3.3");
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Gs = () => {
}, Rn = {
  get passive() {
    return !1;
  }
};
document.addEventListener("x", Gs, Rn);
document.removeEventListener("x", Gs);
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class zn extends se {
  click() {
    if (this.mdcRoot) {
      this.mdcRoot.focus(), this.mdcRoot.click();
      return;
    }
    super.click();
  }
  /**
   * Create and attach the MDC Foundation to the instance
   */
  createFoundation() {
    this.mdcFoundation !== void 0 && this.mdcFoundation.destroy(), this.mdcFoundationClass && (this.mdcFoundation = new this.mdcFoundationClass(this.createAdapter()), this.mdcFoundation.init());
  }
  firstUpdated() {
    this.createFoundation();
  }
}
/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var Mn = (
  /** @class */
  function() {
    function s(t) {
      t === void 0 && (t = {}), this.adapter = t;
    }
    return Object.defineProperty(s, "cssClasses", {
      get: function() {
        return {};
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(s, "strings", {
      get: function() {
        return {};
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(s, "numbers", {
      get: function() {
        return {};
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(s, "defaultAdapter", {
      get: function() {
        return {};
      },
      enumerable: !1,
      configurable: !0
    }), s.prototype.init = function() {
    }, s.prototype.destroy = function() {
    }, s;
  }()
);
/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var Tn = {
  // Ripple is a special case where the "root" component is really a "mixin" of sorts,
  // given that it's an 'upgrade' to an existing component. That being said it is the root
  // CSS class that all other CSS classes derive from.
  BG_FOCUSED: "mdc-ripple-upgraded--background-focused",
  FG_ACTIVATION: "mdc-ripple-upgraded--foreground-activation",
  FG_DEACTIVATION: "mdc-ripple-upgraded--foreground-deactivation",
  ROOT: "mdc-ripple-upgraded",
  UNBOUNDED: "mdc-ripple-upgraded--unbounded"
}, On = {
  VAR_FG_SCALE: "--mdc-ripple-fg-scale",
  VAR_FG_SIZE: "--mdc-ripple-fg-size",
  VAR_FG_TRANSLATE_END: "--mdc-ripple-fg-translate-end",
  VAR_FG_TRANSLATE_START: "--mdc-ripple-fg-translate-start",
  VAR_LEFT: "--mdc-ripple-left",
  VAR_TOP: "--mdc-ripple-top"
}, Vr = {
  DEACTIVATION_TIMEOUT_MS: 225,
  FG_DEACTIVATION_MS: 150,
  INITIAL_ORIGIN_SCALE: 0.6,
  PADDING: 10,
  TAP_DELAY_MS: 300
  // Delay between touch and simulated mouse events on touch devices
};
function Dn(s, t, e) {
  if (!s)
    return { x: 0, y: 0 };
  var i = t.x, r = t.y, n = i + e.left, o = r + e.top, l, a;
  if (s.type === "touchstart") {
    var c = s;
    l = c.changedTouches[0].pageX - n, a = c.changedTouches[0].pageY - o;
  } else {
    var p = s;
    l = p.pageX - n, a = p.pageY - o;
  }
  return { x: l, y: a };
}
/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var Kr = [
  "touchstart",
  "pointerdown",
  "mousedown",
  "keydown"
], Jr = [
  "touchend",
  "pointerup",
  "mouseup",
  "contextmenu"
], xe = [], Nn = (
  /** @class */
  function(s) {
    Io(t, s);
    function t(e) {
      var i = s.call(this, ie(ie({}, t.defaultAdapter), e)) || this;
      return i.activationAnimationHasEnded = !1, i.activationTimer = 0, i.fgDeactivationRemovalTimer = 0, i.fgScale = "0", i.frame = { width: 0, height: 0 }, i.initialSize = 0, i.layoutFrame = 0, i.maxRadius = 0, i.unboundedCoords = { left: 0, top: 0 }, i.activationState = i.defaultActivationState(), i.activationTimerCallback = function() {
        i.activationAnimationHasEnded = !0, i.runDeactivationUXLogicIfReady();
      }, i.activateHandler = function(r) {
        i.activateImpl(r);
      }, i.deactivateHandler = function() {
        i.deactivateImpl();
      }, i.focusHandler = function() {
        i.handleFocus();
      }, i.blurHandler = function() {
        i.handleBlur();
      }, i.resizeHandler = function() {
        i.layout();
      }, i;
    }
    return Object.defineProperty(t, "cssClasses", {
      get: function() {
        return Tn;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t, "strings", {
      get: function() {
        return On;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t, "numbers", {
      get: function() {
        return Vr;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t, "defaultAdapter", {
      get: function() {
        return {
          addClass: function() {
          },
          browserSupportsCssVars: function() {
            return !0;
          },
          computeBoundingRect: function() {
            return { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 };
          },
          containsEventTarget: function() {
            return !0;
          },
          deregisterDocumentInteractionHandler: function() {
          },
          deregisterInteractionHandler: function() {
          },
          deregisterResizeHandler: function() {
          },
          getWindowPageOffset: function() {
            return { x: 0, y: 0 };
          },
          isSurfaceActive: function() {
            return !0;
          },
          isSurfaceDisabled: function() {
            return !0;
          },
          isUnbounded: function() {
            return !0;
          },
          registerDocumentInteractionHandler: function() {
          },
          registerInteractionHandler: function() {
          },
          registerResizeHandler: function() {
          },
          removeClass: function() {
          },
          updateCssVariable: function() {
          }
        };
      },
      enumerable: !1,
      configurable: !0
    }), t.prototype.init = function() {
      var e = this, i = this.supportsPressRipple();
      if (this.registerRootHandlers(i), i) {
        var r = t.cssClasses, n = r.ROOT, o = r.UNBOUNDED;
        requestAnimationFrame(function() {
          e.adapter.addClass(n), e.adapter.isUnbounded() && (e.adapter.addClass(o), e.layoutInternal());
        });
      }
    }, t.prototype.destroy = function() {
      var e = this;
      if (this.supportsPressRipple()) {
        this.activationTimer && (clearTimeout(this.activationTimer), this.activationTimer = 0, this.adapter.removeClass(t.cssClasses.FG_ACTIVATION)), this.fgDeactivationRemovalTimer && (clearTimeout(this.fgDeactivationRemovalTimer), this.fgDeactivationRemovalTimer = 0, this.adapter.removeClass(t.cssClasses.FG_DEACTIVATION));
        var i = t.cssClasses, r = i.ROOT, n = i.UNBOUNDED;
        requestAnimationFrame(function() {
          e.adapter.removeClass(r), e.adapter.removeClass(n), e.removeCssVars();
        });
      }
      this.deregisterRootHandlers(), this.deregisterDeactivationHandlers();
    }, t.prototype.activate = function(e) {
      this.activateImpl(e);
    }, t.prototype.deactivate = function() {
      this.deactivateImpl();
    }, t.prototype.layout = function() {
      var e = this;
      this.layoutFrame && cancelAnimationFrame(this.layoutFrame), this.layoutFrame = requestAnimationFrame(function() {
        e.layoutInternal(), e.layoutFrame = 0;
      });
    }, t.prototype.setUnbounded = function(e) {
      var i = t.cssClasses.UNBOUNDED;
      e ? this.adapter.addClass(i) : this.adapter.removeClass(i);
    }, t.prototype.handleFocus = function() {
      var e = this;
      requestAnimationFrame(function() {
        return e.adapter.addClass(t.cssClasses.BG_FOCUSED);
      });
    }, t.prototype.handleBlur = function() {
      var e = this;
      requestAnimationFrame(function() {
        return e.adapter.removeClass(t.cssClasses.BG_FOCUSED);
      });
    }, t.prototype.supportsPressRipple = function() {
      return this.adapter.browserSupportsCssVars();
    }, t.prototype.defaultActivationState = function() {
      return {
        activationEvent: void 0,
        hasDeactivationUXRun: !1,
        isActivated: !1,
        isProgrammatic: !1,
        wasActivatedByPointer: !1,
        wasElementMadeActive: !1
      };
    }, t.prototype.registerRootHandlers = function(e) {
      var i, r;
      if (e) {
        try {
          for (var n = $e(Kr), o = n.next(); !o.done; o = n.next()) {
            var l = o.value;
            this.adapter.registerInteractionHandler(l, this.activateHandler);
          }
        } catch (a) {
          i = { error: a };
        } finally {
          try {
            o && !o.done && (r = n.return) && r.call(n);
          } finally {
            if (i) throw i.error;
          }
        }
        this.adapter.isUnbounded() && this.adapter.registerResizeHandler(this.resizeHandler);
      }
      this.adapter.registerInteractionHandler("focus", this.focusHandler), this.adapter.registerInteractionHandler("blur", this.blurHandler);
    }, t.prototype.registerDeactivationHandlers = function(e) {
      var i, r;
      if (e.type === "keydown")
        this.adapter.registerInteractionHandler("keyup", this.deactivateHandler);
      else
        try {
          for (var n = $e(Jr), o = n.next(); !o.done; o = n.next()) {
            var l = o.value;
            this.adapter.registerDocumentInteractionHandler(l, this.deactivateHandler);
          }
        } catch (a) {
          i = { error: a };
        } finally {
          try {
            o && !o.done && (r = n.return) && r.call(n);
          } finally {
            if (i) throw i.error;
          }
        }
    }, t.prototype.deregisterRootHandlers = function() {
      var e, i;
      try {
        for (var r = $e(Kr), n = r.next(); !n.done; n = r.next()) {
          var o = n.value;
          this.adapter.deregisterInteractionHandler(o, this.activateHandler);
        }
      } catch (l) {
        e = { error: l };
      } finally {
        try {
          n && !n.done && (i = r.return) && i.call(r);
        } finally {
          if (e) throw e.error;
        }
      }
      this.adapter.deregisterInteractionHandler("focus", this.focusHandler), this.adapter.deregisterInteractionHandler("blur", this.blurHandler), this.adapter.isUnbounded() && this.adapter.deregisterResizeHandler(this.resizeHandler);
    }, t.prototype.deregisterDeactivationHandlers = function() {
      var e, i;
      this.adapter.deregisterInteractionHandler("keyup", this.deactivateHandler);
      try {
        for (var r = $e(Jr), n = r.next(); !n.done; n = r.next()) {
          var o = n.value;
          this.adapter.deregisterDocumentInteractionHandler(o, this.deactivateHandler);
        }
      } catch (l) {
        e = { error: l };
      } finally {
        try {
          n && !n.done && (i = r.return) && i.call(r);
        } finally {
          if (e) throw e.error;
        }
      }
    }, t.prototype.removeCssVars = function() {
      var e = this, i = t.strings, r = Object.keys(i);
      r.forEach(function(n) {
        n.indexOf("VAR_") === 0 && e.adapter.updateCssVariable(i[n], null);
      });
    }, t.prototype.activateImpl = function(e) {
      var i = this;
      if (!this.adapter.isSurfaceDisabled()) {
        var r = this.activationState;
        if (!r.isActivated) {
          var n = this.previousActivationEvent, o = n && e !== void 0 && n.type !== e.type;
          if (!o) {
            r.isActivated = !0, r.isProgrammatic = e === void 0, r.activationEvent = e, r.wasActivatedByPointer = r.isProgrammatic ? !1 : e !== void 0 && (e.type === "mousedown" || e.type === "touchstart" || e.type === "pointerdown");
            var l = e !== void 0 && xe.length > 0 && xe.some(function(a) {
              return i.adapter.containsEventTarget(a);
            });
            if (l) {
              this.resetActivationState();
              return;
            }
            e !== void 0 && (xe.push(e.target), this.registerDeactivationHandlers(e)), r.wasElementMadeActive = this.checkElementMadeActive(e), r.wasElementMadeActive && this.animateActivation(), requestAnimationFrame(function() {
              xe = [], !r.wasElementMadeActive && e !== void 0 && (e.key === " " || e.keyCode === 32) && (r.wasElementMadeActive = i.checkElementMadeActive(e), r.wasElementMadeActive && i.animateActivation()), r.wasElementMadeActive || (i.activationState = i.defaultActivationState());
            });
          }
        }
      }
    }, t.prototype.checkElementMadeActive = function(e) {
      return e !== void 0 && e.type === "keydown" ? this.adapter.isSurfaceActive() : !0;
    }, t.prototype.animateActivation = function() {
      var e = this, i = t.strings, r = i.VAR_FG_TRANSLATE_START, n = i.VAR_FG_TRANSLATE_END, o = t.cssClasses, l = o.FG_DEACTIVATION, a = o.FG_ACTIVATION, c = t.numbers.DEACTIVATION_TIMEOUT_MS;
      this.layoutInternal();
      var p = "", d = "";
      if (!this.adapter.isUnbounded()) {
        var h = this.getFgTranslationCoordinates(), m = h.startPoint, _ = h.endPoint;
        p = m.x + "px, " + m.y + "px", d = _.x + "px, " + _.y + "px";
      }
      this.adapter.updateCssVariable(r, p), this.adapter.updateCssVariable(n, d), clearTimeout(this.activationTimer), clearTimeout(this.fgDeactivationRemovalTimer), this.rmBoundedActivationClasses(), this.adapter.removeClass(l), this.adapter.computeBoundingRect(), this.adapter.addClass(a), this.activationTimer = setTimeout(function() {
        e.activationTimerCallback();
      }, c);
    }, t.prototype.getFgTranslationCoordinates = function() {
      var e = this.activationState, i = e.activationEvent, r = e.wasActivatedByPointer, n;
      r ? n = Dn(i, this.adapter.getWindowPageOffset(), this.adapter.computeBoundingRect()) : n = {
        x: this.frame.width / 2,
        y: this.frame.height / 2
      }, n = {
        x: n.x - this.initialSize / 2,
        y: n.y - this.initialSize / 2
      };
      var o = {
        x: this.frame.width / 2 - this.initialSize / 2,
        y: this.frame.height / 2 - this.initialSize / 2
      };
      return { startPoint: n, endPoint: o };
    }, t.prototype.runDeactivationUXLogicIfReady = function() {
      var e = this, i = t.cssClasses.FG_DEACTIVATION, r = this.activationState, n = r.hasDeactivationUXRun, o = r.isActivated, l = n || !o;
      l && this.activationAnimationHasEnded && (this.rmBoundedActivationClasses(), this.adapter.addClass(i), this.fgDeactivationRemovalTimer = setTimeout(function() {
        e.adapter.removeClass(i);
      }, Vr.FG_DEACTIVATION_MS));
    }, t.prototype.rmBoundedActivationClasses = function() {
      var e = t.cssClasses.FG_ACTIVATION;
      this.adapter.removeClass(e), this.activationAnimationHasEnded = !1, this.adapter.computeBoundingRect();
    }, t.prototype.resetActivationState = function() {
      var e = this;
      this.previousActivationEvent = this.activationState.activationEvent, this.activationState = this.defaultActivationState(), setTimeout(function() {
        return e.previousActivationEvent = void 0;
      }, t.numbers.TAP_DELAY_MS);
    }, t.prototype.deactivateImpl = function() {
      var e = this, i = this.activationState;
      if (i.isActivated) {
        var r = ie({}, i);
        i.isProgrammatic ? (requestAnimationFrame(function() {
          e.animateDeactivation(r);
        }), this.resetActivationState()) : (this.deregisterDeactivationHandlers(), requestAnimationFrame(function() {
          e.activationState.hasDeactivationUXRun = !0, e.animateDeactivation(r), e.resetActivationState();
        }));
      }
    }, t.prototype.animateDeactivation = function(e) {
      var i = e.wasActivatedByPointer, r = e.wasElementMadeActive;
      (i || r) && this.runDeactivationUXLogicIfReady();
    }, t.prototype.layoutInternal = function() {
      var e = this;
      this.frame = this.adapter.computeBoundingRect();
      var i = Math.max(this.frame.height, this.frame.width), r = function() {
        var o = Math.sqrt(Math.pow(e.frame.width, 2) + Math.pow(e.frame.height, 2));
        return o + t.numbers.PADDING;
      };
      this.maxRadius = this.adapter.isUnbounded() ? i : r();
      var n = Math.floor(i * t.numbers.INITIAL_ORIGIN_SCALE);
      this.adapter.isUnbounded() && n % 2 !== 0 ? this.initialSize = n - 1 : this.initialSize = n, this.fgScale = "" + this.maxRadius / this.initialSize, this.updateLayoutCssVars();
    }, t.prototype.updateLayoutCssVars = function() {
      var e = t.strings, i = e.VAR_FG_SIZE, r = e.VAR_LEFT, n = e.VAR_TOP, o = e.VAR_FG_SCALE;
      this.adapter.updateCssVariable(i, this.initialSize + "px"), this.adapter.updateCssVariable(o, this.fgScale), this.adapter.isUnbounded() && (this.unboundedCoords = {
        left: Math.round(this.frame.width / 2 - this.initialSize / 2),
        top: Math.round(this.frame.height / 2 - this.initialSize / 2)
      }, this.adapter.updateCssVariable(r, this.unboundedCoords.left + "px"), this.adapter.updateCssVariable(n, this.unboundedCoords.top + "px"));
    }, t;
  }(Mn)
);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ee = window, tr = Ee.ShadowRoot && (Ee.ShadyCSS === void 0 || Ee.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, er = Symbol(), Xr = /* @__PURE__ */ new WeakMap();
let Vs = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== er) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (tr && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Xr.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Xr.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const In = (s) => new Vs(typeof s == "string" ? s : s + "", void 0, er), Bn = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new Vs(e, s, er);
}, Ln = (s, t) => {
  tr ? s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet) : t.forEach((e) => {
    const i = document.createElement("style"), r = Ee.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  });
}, Qr = tr ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return In(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var di;
const Oe = window, Yr = Oe.trustedTypes, jn = Yr ? Yr.emptyScript : "", ts = Oe.reactiveElementPolyfillSupport, zi = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? jn : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, Ks = (s, t) => t !== s && (t == t || s == s), pi = { attribute: !0, type: String, converter: zi, reflect: !1, hasChanged: Ks }, Mi = "finalized";
let zt = class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
  }
  static addInitializer(t) {
    var e;
    this.finalize(), ((e = this.h) !== null && e !== void 0 ? e : this.h = []).push(t);
  }
  static get observedAttributes() {
    this.finalize();
    const t = [];
    return this.elementProperties.forEach((e, i) => {
      const r = this._$Ep(i, e);
      r !== void 0 && (this._$Ev.set(r, i), t.push(r));
    }), t;
  }
  static createProperty(t, e = pi) {
    if (e.state && (e.attribute = !1), this.finalize(), this.elementProperties.set(t, e), !e.noAccessor && !this.prototype.hasOwnProperty(t)) {
      const i = typeof t == "symbol" ? Symbol() : "__" + t, r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && Object.defineProperty(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    return { get() {
      return this[e];
    }, set(r) {
      const n = this[t];
      this[e] = r, this.requestUpdate(t, n, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) || pi;
  }
  static finalize() {
    if (this.hasOwnProperty(Mi)) return !1;
    this[Mi] = !0;
    const t = Object.getPrototypeOf(this);
    if (t.finalize(), t.h !== void 0 && (this.h = [...t.h]), this.elementProperties = new Map(t.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const e = this.properties, i = [...Object.getOwnPropertyNames(e), ...Object.getOwnPropertySymbols(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), !0;
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(Qr(r));
    } else t !== void 0 && e.push(Qr(t));
    return e;
  }
  static _$Ep(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  _$Eu() {
    var t;
    this._$E_ = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), (t = this.constructor.h) === null || t === void 0 || t.forEach((e) => e(this));
  }
  addController(t) {
    var e, i;
    ((e = this._$ES) !== null && e !== void 0 ? e : this._$ES = []).push(t), this.renderRoot !== void 0 && this.isConnected && ((i = t.hostConnected) === null || i === void 0 || i.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.splice(this._$ES.indexOf(t) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((t, e) => {
      this.hasOwnProperty(e) && (this._$Ei.set(e, this[e]), delete this[e]);
    });
  }
  createRenderRoot() {
    var t;
    const e = (t = this.shadowRoot) !== null && t !== void 0 ? t : this.attachShadow(this.constructor.shadowRootOptions);
    return Ln(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var t;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) === null || i === void 0 ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) === null || i === void 0 ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$EO(t, e, i = pi) {
    var r;
    const n = this.constructor._$Ep(t, i);
    if (n !== void 0 && i.reflect === !0) {
      const o = (((r = i.converter) === null || r === void 0 ? void 0 : r.toAttribute) !== void 0 ? i.converter : zi).toAttribute(e, i.type);
      this._$El = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$El = null;
    }
  }
  _$AK(t, e) {
    var i;
    const r = this.constructor, n = r._$Ev.get(t);
    if (n !== void 0 && this._$El !== n) {
      const o = r.getPropertyOptions(n), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((i = o.converter) === null || i === void 0 ? void 0 : i.fromAttribute) !== void 0 ? o.converter : zi;
      this._$El = n, this[n] = l.fromAttribute(e, o.type), this._$El = null;
    }
  }
  requestUpdate(t, e, i) {
    let r = !0;
    t !== void 0 && (((i = i || this.constructor.getPropertyOptions(t)).hasChanged || Ks)(this[t], e) ? (this._$AL.has(t) || this._$AL.set(t, e), i.reflect === !0 && this._$El !== t && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t, i))) : r = !1), !this.isUpdatePending && r && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = !0;
    try {
      await this._$E_;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t;
    if (!this.isUpdatePending) return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((r, n) => this[n] = r), this._$Ei = void 0);
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), (t = this._$ES) === null || t === void 0 || t.forEach((r) => {
        var n;
        return (n = r.hostUpdate) === null || n === void 0 ? void 0 : n.call(r);
      }), this.update(i)) : this._$Ek();
    } catch (r) {
      throw e = !1, this._$Ek(), r;
    }
    e && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.forEach((i) => {
      var r;
      return (r = i.hostUpdated) === null || r === void 0 ? void 0 : r.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$Ek() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$EC !== void 0 && (this._$EC.forEach((e, i) => this._$EO(i, this[i], e)), this._$EC = void 0), this._$Ek();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
zt[Mi] = !0, zt.elementProperties = /* @__PURE__ */ new Map(), zt.elementStyles = [], zt.shadowRootOptions = { mode: "open" }, ts == null || ts({ ReactiveElement: zt }), ((di = Oe.reactiveElementVersions) !== null && di !== void 0 ? di : Oe.reactiveElementVersions = []).push("1.6.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var hi;
const De = window, Wt = De.trustedTypes, es = Wt ? Wt.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Ti = "$lit$", Y = `lit$${(Math.random() + "").slice(9)}$`, Js = "?" + Y, Fn = `<${Js}>`, St = document, me = () => St.createComment(""), fe = (s) => s === null || typeof s != "object" && typeof s != "function", Xs = Array.isArray, Wn = (s) => Xs(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", ui = `[ 	
\f\r]`, Qt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, is = /-->/g, rs = />/g, mt = RegExp(`>|${ui}(?:([^\\s"'>=/]+)(${ui}*=${ui}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ss = /'/g, os = /"/g, Qs = /^(?:script|style|textarea|title)$/i, qn = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), Zn = qn(1), it = Symbol.for("lit-noChange"), P = Symbol.for("lit-nothing"), ns = /* @__PURE__ */ new WeakMap(), yt = St.createTreeWalker(St, 129, null, !1);
function Ys(s, t) {
  if (!Array.isArray(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return es !== void 0 ? es.createHTML(t) : t;
}
const Gn = (s, t) => {
  const e = s.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : "", o = Qt;
  for (let l = 0; l < e; l++) {
    const a = s[l];
    let c, p, d = -1, h = 0;
    for (; h < a.length && (o.lastIndex = h, p = o.exec(a), p !== null); ) h = o.lastIndex, o === Qt ? p[1] === "!--" ? o = is : p[1] !== void 0 ? o = rs : p[2] !== void 0 ? (Qs.test(p[2]) && (r = RegExp("</" + p[2], "g")), o = mt) : p[3] !== void 0 && (o = mt) : o === mt ? p[0] === ">" ? (o = r ?? Qt, d = -1) : p[1] === void 0 ? d = -2 : (d = o.lastIndex - p[2].length, c = p[1], o = p[3] === void 0 ? mt : p[3] === '"' ? os : ss) : o === os || o === ss ? o = mt : o === is || o === rs ? o = Qt : (o = mt, r = void 0);
    const m = o === mt && s[l + 1].startsWith("/>") ? " " : "";
    n += o === Qt ? a + Fn : d >= 0 ? (i.push(c), a.slice(0, d) + Ti + a.slice(d) + Y + m) : a + Y + (d === -2 ? (i.push(void 0), l) : m);
  }
  return [Ys(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : "")), i];
};
let Oi = class to {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, a = this.parts, [c, p] = Gn(t, e);
    if (this.el = to.createElement(c, i), yt.currentNode = this.el.content, e === 2) {
      const d = this.el.content, h = d.firstChild;
      h.remove(), d.append(...h.childNodes);
    }
    for (; (r = yt.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) {
          const d = [];
          for (const h of r.getAttributeNames()) if (h.endsWith(Ti) || h.startsWith(Y)) {
            const m = p[o++];
            if (d.push(h), m !== void 0) {
              const _ = r.getAttribute(m.toLowerCase() + Ti).split(Y), v = /([.?@])?(.*)/.exec(m);
              a.push({ type: 1, index: n, name: v[2], strings: _, ctor: v[1] === "." ? Kn : v[1] === "?" ? Xn : v[1] === "@" ? Qn : Fe });
            } else a.push({ type: 6, index: n });
          }
          for (const h of d) r.removeAttribute(h);
        }
        if (Qs.test(r.tagName)) {
          const d = r.textContent.split(Y), h = d.length - 1;
          if (h > 0) {
            r.textContent = Wt ? Wt.emptyScript : "";
            for (let m = 0; m < h; m++) r.append(d[m], me()), yt.nextNode(), a.push({ type: 2, index: ++n });
            r.append(d[h], me());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Js) a.push({ type: 2, index: n });
      else {
        let d = -1;
        for (; (d = r.data.indexOf(Y, d + 1)) !== -1; ) a.push({ type: 7, index: n }), d += Y.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = St.createElement("template");
    return i.innerHTML = t, i;
  }
};
function qt(s, t, e = s, i) {
  var r, n, o, l;
  if (t === it) return t;
  let a = i !== void 0 ? (r = e._$Co) === null || r === void 0 ? void 0 : r[i] : e._$Cl;
  const c = fe(t) ? void 0 : t._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== c && ((n = a == null ? void 0 : a._$AO) === null || n === void 0 || n.call(a, !1), c === void 0 ? a = void 0 : (a = new c(s), a._$AT(s, e, i)), i !== void 0 ? ((o = (l = e)._$Co) !== null && o !== void 0 ? o : l._$Co = [])[i] = a : e._$Cl = a), a !== void 0 && (t = qt(s, a._$AS(s, t.values), a, i)), t;
}
let Vn = class {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    var e;
    const { el: { content: i }, parts: r } = this._$AD, n = ((e = t == null ? void 0 : t.creationScope) !== null && e !== void 0 ? e : St).importNode(i, !0);
    yt.currentNode = n;
    let o = yt.nextNode(), l = 0, a = 0, c = r[0];
    for (; c !== void 0; ) {
      if (l === c.index) {
        let p;
        c.type === 2 ? p = new ir(o, o.nextSibling, this, t) : c.type === 1 ? p = new c.ctor(o, c.name, c.strings, this, t) : c.type === 6 && (p = new Yn(o, this, t)), this._$AV.push(p), c = r[++a];
      }
      l !== (c == null ? void 0 : c.index) && (o = yt.nextNode(), l++);
    }
    return yt.currentNode = St, n;
  }
  v(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}, ir = class eo {
  constructor(t, e, i, r) {
    var n;
    this.type = 2, this._$AH = P, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cp = (n = r == null ? void 0 : r.isConnected) === null || n === void 0 || n;
  }
  get _$AU() {
    var t, e;
    return (e = (t = this._$AM) === null || t === void 0 ? void 0 : t._$AU) !== null && e !== void 0 ? e : this._$Cp;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = qt(this, t, e), fe(t) ? t === P || t == null || t === "" ? (this._$AH !== P && this._$AR(), this._$AH = P) : t !== this._$AH && t !== it && this._(t) : t._$litType$ !== void 0 ? this.g(t) : t.nodeType !== void 0 ? this.$(t) : Wn(t) ? this.T(t) : this._(t);
  }
  k(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  $(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.k(t));
  }
  _(t) {
    this._$AH !== P && fe(this._$AH) ? this._$AA.nextSibling.data = t : this.$(St.createTextNode(t)), this._$AH = t;
  }
  g(t) {
    var e;
    const { values: i, _$litType$: r } = t, n = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = Oi.createElement(Ys(r.h, r.h[0]), this.options)), r);
    if (((e = this._$AH) === null || e === void 0 ? void 0 : e._$AD) === n) this._$AH.v(i);
    else {
      const o = new Vn(n, this), l = o.u(this.options);
      o.v(i), this.$(l), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = ns.get(t.strings);
    return e === void 0 && ns.set(t.strings, e = new Oi(t)), e;
  }
  T(t) {
    Xs(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const n of t) r === e.length ? e.push(i = new eo(this.k(me()), this.k(me()), this, this.options)) : i = e[r], i._$AI(n), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, !1, !0, e); t && t !== this._$AB; ) {
      const r = t.nextSibling;
      t.remove(), t = r;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cp = t, (e = this._$AP) === null || e === void 0 || e.call(this, t));
  }
}, Fe = class {
  constructor(t, e, i, r, n) {
    this.type = 1, this._$AH = P, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = P;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t, e = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = qt(this, t, e, 0), o = !fe(t) || t !== this._$AH && t !== it, o && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = n[0], a = 0; a < n.length - 1; a++) c = qt(this, l[i + a], e, a), c === it && (c = this._$AH[a]), o || (o = !fe(c) || c !== this._$AH[a]), c === P ? t = P : t !== P && (t += (c ?? "") + n[a + 1]), this._$AH[a] = c;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === P ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}, Kn = class extends Fe {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === P ? void 0 : t;
  }
};
const Jn = Wt ? Wt.emptyScript : "";
let Xn = class extends Fe {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    t && t !== P ? this.element.setAttribute(this.name, Jn) : this.element.removeAttribute(this.name);
  }
}, Qn = class extends Fe {
  constructor(t, e, i, r, n) {
    super(t, e, i, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    var i;
    if ((t = (i = qt(this, t, e, 0)) !== null && i !== void 0 ? i : P) === it) return;
    const r = this._$AH, n = t === P && r !== P || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, o = t !== P && (r === P || n);
    n && this.element.removeEventListener(this.name, this, r), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (e = this.options) === null || e === void 0 ? void 0 : e.host) !== null && i !== void 0 ? i : this.element, t) : this._$AH.handleEvent(t);
  }
}, Yn = class {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    qt(this, t);
  }
};
const as = De.litHtmlPolyfillSupport;
as == null || as(Oi, ir), ((hi = De.litHtmlVersions) !== null && hi !== void 0 ? hi : De.litHtmlVersions = []).push("2.8.0");
const ta = (s, t, e) => {
  var i, r;
  const n = (i = e == null ? void 0 : e.renderBefore) !== null && i !== void 0 ? i : t;
  let o = n._$litPart$;
  if (o === void 0) {
    const l = (r = e == null ? void 0 : e.renderBefore) !== null && r !== void 0 ? r : null;
    n._$litPart$ = o = new ir(t.insertBefore(me(), l), l, void 0, e ?? {});
  }
  return o._$AI(s), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var mi, fi;
let ke = class extends zt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t, e;
    const i = super.createRenderRoot();
    return (t = (e = this.renderOptions).renderBefore) !== null && t !== void 0 || (e.renderBefore = i.firstChild), i;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ta(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!1);
  }
  render() {
    return it;
  }
};
ke.finalized = !0, ke._$litElement$ = !0, (mi = globalThis.litElementHydrateSupport) === null || mi === void 0 || mi.call(globalThis, { LitElement: ke });
const ls = globalThis.litElementPolyfillSupport;
ls == null || ls({ LitElement: ke });
((fi = globalThis.litElementVersions) !== null && fi !== void 0 ? fi : globalThis.litElementVersions = []).push("3.3.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const io = { ATTRIBUTE: 1 }, ro = (s) => (...t) => ({ _$litDirective$: s, values: t });
let so = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, i) {
    this._$Ct = t, this._$AM = e, this._$Ci = i;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
};
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ea = ro(class extends so {
  constructor(s) {
    var t;
    if (super(s), s.type !== io.ATTRIBUTE || s.name !== "class" || ((t = s.strings) === null || t === void 0 ? void 0 : t.length) > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(s) {
    return " " + Object.keys(s).filter((t) => s[t]).join(" ") + " ";
  }
  update(s, [t]) {
    var e, i;
    if (this.it === void 0) {
      this.it = /* @__PURE__ */ new Set(), s.strings !== void 0 && (this.nt = new Set(s.strings.join(" ").split(/\s/).filter((n) => n !== "")));
      for (const n in t) t[n] && !(!((e = this.nt) === null || e === void 0) && e.has(n)) && this.it.add(n);
      return this.render(t);
    }
    const r = s.element.classList;
    this.it.forEach((n) => {
      n in t || (r.remove(n), this.it.delete(n));
    });
    for (const n in t) {
      const o = !!t[n];
      o === this.it.has(n) || !((i = this.nt) === null || i === void 0) && i.has(n) || (o ? (r.add(n), this.it.add(n)) : (r.remove(n), this.it.delete(n)));
    }
    return it;
  }
});
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oo = "important", ia = " !" + oo, ra = ro(class extends so {
  constructor(s) {
    var t;
    if (super(s), s.type !== io.ATTRIBUTE || s.name !== "style" || ((t = s.strings) === null || t === void 0 ? void 0 : t.length) > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(s) {
    return Object.keys(s).reduce((t, e) => {
      const i = s[e];
      return i == null ? t : t + `${e = e.includes("-") ? e : e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${i};`;
    }, "");
  }
  update(s, [t]) {
    const { style: e } = s.element;
    if (this.ht === void 0) {
      this.ht = /* @__PURE__ */ new Set();
      for (const i in t) this.ht.add(i);
      return this.render(t);
    }
    this.ht.forEach((i) => {
      t[i] == null && (this.ht.delete(i), i.includes("-") ? e.removeProperty(i) : e[i] = "");
    });
    for (const i in t) {
      const r = t[i];
      if (r != null) {
        this.ht.add(i);
        const n = typeof r == "string" && r.endsWith(ia);
        i.includes("-") || n ? e.setProperty(i, n ? r.slice(0, -11) : r, n ? oo : "") : e[i] = r;
      }
    }
    return it;
  }
});
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class C extends zn {
  constructor() {
    super(...arguments), this.primary = !1, this.accent = !1, this.unbounded = !1, this.disabled = !1, this.activated = !1, this.selected = !1, this.internalUseStateLayerCustomProperties = !1, this.hovering = !1, this.bgFocused = !1, this.fgActivation = !1, this.fgDeactivation = !1, this.fgScale = "", this.fgSize = "", this.translateStart = "", this.translateEnd = "", this.leftPos = "", this.topPos = "", this.mdcFoundationClass = Nn;
  }
  get isActive() {
    return gn(this.parentElement || this, ":active");
  }
  createAdapter() {
    return {
      browserSupportsCssVars: () => !0,
      isUnbounded: () => this.unbounded,
      isSurfaceActive: () => this.isActive,
      isSurfaceDisabled: () => this.disabled,
      addClass: (t) => {
        switch (t) {
          case "mdc-ripple-upgraded--background-focused":
            this.bgFocused = !0;
            break;
          case "mdc-ripple-upgraded--foreground-activation":
            this.fgActivation = !0;
            break;
          case "mdc-ripple-upgraded--foreground-deactivation":
            this.fgDeactivation = !0;
            break;
        }
      },
      removeClass: (t) => {
        switch (t) {
          case "mdc-ripple-upgraded--background-focused":
            this.bgFocused = !1;
            break;
          case "mdc-ripple-upgraded--foreground-activation":
            this.fgActivation = !1;
            break;
          case "mdc-ripple-upgraded--foreground-deactivation":
            this.fgDeactivation = !1;
            break;
        }
      },
      containsEventTarget: () => !0,
      registerInteractionHandler: () => {
      },
      deregisterInteractionHandler: () => {
      },
      registerDocumentInteractionHandler: () => {
      },
      deregisterDocumentInteractionHandler: () => {
      },
      registerResizeHandler: () => {
      },
      deregisterResizeHandler: () => {
      },
      updateCssVariable: (t, e) => {
        switch (t) {
          case "--mdc-ripple-fg-scale":
            this.fgScale = e;
            break;
          case "--mdc-ripple-fg-size":
            this.fgSize = e;
            break;
          case "--mdc-ripple-fg-translate-end":
            this.translateEnd = e;
            break;
          case "--mdc-ripple-fg-translate-start":
            this.translateStart = e;
            break;
          case "--mdc-ripple-left":
            this.leftPos = e;
            break;
          case "--mdc-ripple-top":
            this.topPos = e;
            break;
        }
      },
      computeBoundingRect: () => (this.parentElement || this).getBoundingClientRect(),
      getWindowPageOffset: () => ({ x: window.pageXOffset, y: window.pageYOffset })
    };
  }
  startPress(t) {
    this.waitForFoundation(() => {
      this.mdcFoundation.activate(t);
    });
  }
  endPress() {
    this.waitForFoundation(() => {
      this.mdcFoundation.deactivate();
    });
  }
  startFocus() {
    this.waitForFoundation(() => {
      this.mdcFoundation.handleFocus();
    });
  }
  endFocus() {
    this.waitForFoundation(() => {
      this.mdcFoundation.handleBlur();
    });
  }
  startHover() {
    this.hovering = !0;
  }
  endHover() {
    this.hovering = !1;
  }
  /**
   * Wait for the MDCFoundation to be created by `firstUpdated`
   */
  waitForFoundation(t) {
    this.mdcFoundation ? t() : this.updateComplete.then(t);
  }
  update(t) {
    t.has("disabled") && this.disabled && this.endHover(), super.update(t);
  }
  /** @soyTemplate */
  render() {
    const t = this.activated && (this.primary || !this.accent), e = this.selected && (this.primary || !this.accent), i = {
      "mdc-ripple-surface--accent": this.accent,
      "mdc-ripple-surface--primary--activated": t,
      "mdc-ripple-surface--accent--activated": this.accent && this.activated,
      "mdc-ripple-surface--primary--selected": e,
      "mdc-ripple-surface--accent--selected": this.accent && this.selected,
      "mdc-ripple-surface--disabled": this.disabled,
      "mdc-ripple-surface--hover": this.hovering,
      "mdc-ripple-surface--primary": this.primary,
      "mdc-ripple-surface--selected": this.selected,
      "mdc-ripple-upgraded--background-focused": this.bgFocused,
      "mdc-ripple-upgraded--foreground-activation": this.fgActivation,
      "mdc-ripple-upgraded--foreground-deactivation": this.fgDeactivation,
      "mdc-ripple-upgraded--unbounded": this.unbounded,
      "mdc-ripple-surface--internal-use-state-layer-custom-properties": this.internalUseStateLayerCustomProperties
    };
    return Zn`
        <div class="mdc-ripple-surface mdc-ripple-upgraded ${ea(i)}"
          style="${ra({
      "--mdc-ripple-fg-scale": this.fgScale,
      "--mdc-ripple-fg-size": this.fgSize,
      "--mdc-ripple-fg-translate-end": this.translateEnd,
      "--mdc-ripple-fg-translate-start": this.translateStart,
      "--mdc-ripple-left": this.leftPos,
      "--mdc-ripple-top": this.topPos
    })}"></div>`;
  }
}
g([
  vn(".mdc-ripple-surface")
], C.prototype, "mdcRoot", void 0);
g([
  ot({ type: Boolean })
], C.prototype, "primary", void 0);
g([
  ot({ type: Boolean })
], C.prototype, "accent", void 0);
g([
  ot({ type: Boolean })
], C.prototype, "unbounded", void 0);
g([
  ot({ type: Boolean })
], C.prototype, "disabled", void 0);
g([
  ot({ type: Boolean })
], C.prototype, "activated", void 0);
g([
  ot({ type: Boolean })
], C.prototype, "selected", void 0);
g([
  ot({ type: Boolean })
], C.prototype, "internalUseStateLayerCustomProperties", void 0);
g([
  W()
], C.prototype, "hovering", void 0);
g([
  W()
], C.prototype, "bgFocused", void 0);
g([
  W()
], C.prototype, "fgActivation", void 0);
g([
  W()
], C.prototype, "fgDeactivation", void 0);
g([
  W()
], C.prototype, "fgScale", void 0);
g([
  W()
], C.prototype, "fgSize", void 0);
g([
  W()
], C.prototype, "translateStart", void 0);
g([
  W()
], C.prototype, "translateEnd", void 0);
g([
  W()
], C.prototype, "leftPos", void 0);
g([
  W()
], C.prototype, "topPos", void 0);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-LIcense-Identifier: Apache-2.0
 */
const sa = Bn`.mdc-ripple-surface{--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity;position:relative;outline:none;overflow:hidden}.mdc-ripple-surface::before,.mdc-ripple-surface::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}.mdc-ripple-surface::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1;z-index:var(--mdc-ripple-z-index, 1)}.mdc-ripple-surface::after{z-index:0;z-index:var(--mdc-ripple-z-index, 0)}.mdc-ripple-surface.mdc-ripple-upgraded::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}.mdc-ripple-surface.mdc-ripple-upgraded::after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-ripple-surface.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}.mdc-ripple-surface.mdc-ripple-upgraded--foreground-activation::after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}.mdc-ripple-surface.mdc-ripple-upgraded--foreground-deactivation::after{animation:mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}.mdc-ripple-surface::before,.mdc-ripple-surface::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}.mdc-ripple-surface.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-ripple-surface[data-mdc-ripple-is-unbounded],.mdc-ripple-upgraded--unbounded{overflow:visible}.mdc-ripple-surface[data-mdc-ripple-is-unbounded]::before,.mdc-ripple-surface[data-mdc-ripple-is-unbounded]::after,.mdc-ripple-upgraded--unbounded::before,.mdc-ripple-upgraded--unbounded::after{top:calc(50% - 50%);left:calc(50% - 50%);width:100%;height:100%}.mdc-ripple-surface[data-mdc-ripple-is-unbounded].mdc-ripple-upgraded::before,.mdc-ripple-surface[data-mdc-ripple-is-unbounded].mdc-ripple-upgraded::after,.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::before,.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::after{top:var(--mdc-ripple-top, calc(50% - 50%));left:var(--mdc-ripple-left, calc(50% - 50%));width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-ripple-surface[data-mdc-ripple-is-unbounded].mdc-ripple-upgraded::after,.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-ripple-surface::before,.mdc-ripple-surface::after{background-color:#000;background-color:var(--mdc-ripple-color, #000)}.mdc-ripple-surface:hover::before,.mdc-ripple-surface.mdc-ripple-surface--hover::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-ripple-surface.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-ripple-surface:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity, 0.12)}@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}:host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;display:block}:host .mdc-ripple-surface{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;will-change:unset}.mdc-ripple-surface--primary::before,.mdc-ripple-surface--primary::after{background-color:#6200ee;background-color:var(--mdc-ripple-color, var(--mdc-theme-primary, #6200ee))}.mdc-ripple-surface--primary:hover::before,.mdc-ripple-surface--primary.mdc-ripple-surface--hover::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-ripple-surface--primary.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--primary:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-ripple-surface--primary:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--primary:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface--primary.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface--primary--activated::before{opacity:0.12;opacity:var(--mdc-ripple-activated-opacity, 0.12)}.mdc-ripple-surface--primary--activated::before,.mdc-ripple-surface--primary--activated::after{background-color:#6200ee;background-color:var(--mdc-ripple-color, var(--mdc-theme-primary, #6200ee))}.mdc-ripple-surface--primary--activated:hover::before,.mdc-ripple-surface--primary--activated.mdc-ripple-surface--hover::before{opacity:0.16;opacity:var(--mdc-ripple-hover-opacity, 0.16)}.mdc-ripple-surface--primary--activated.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--primary--activated:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-focus-opacity, 0.24)}.mdc-ripple-surface--primary--activated:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--primary--activated:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-press-opacity, 0.24)}.mdc-ripple-surface--primary--activated.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity, 0.24)}.mdc-ripple-surface--primary--selected::before{opacity:0.08;opacity:var(--mdc-ripple-selected-opacity, 0.08)}.mdc-ripple-surface--primary--selected::before,.mdc-ripple-surface--primary--selected::after{background-color:#6200ee;background-color:var(--mdc-ripple-color, var(--mdc-theme-primary, #6200ee))}.mdc-ripple-surface--primary--selected:hover::before,.mdc-ripple-surface--primary--selected.mdc-ripple-surface--hover::before{opacity:0.12;opacity:var(--mdc-ripple-hover-opacity, 0.12)}.mdc-ripple-surface--primary--selected.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--primary--selected:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.2;opacity:var(--mdc-ripple-focus-opacity, 0.2)}.mdc-ripple-surface--primary--selected:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--primary--selected:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.2;opacity:var(--mdc-ripple-press-opacity, 0.2)}.mdc-ripple-surface--primary--selected.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity, 0.2)}.mdc-ripple-surface--accent::before,.mdc-ripple-surface--accent::after{background-color:#018786;background-color:var(--mdc-ripple-color, var(--mdc-theme-secondary, #018786))}.mdc-ripple-surface--accent:hover::before,.mdc-ripple-surface--accent.mdc-ripple-surface--hover::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-ripple-surface--accent.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--accent:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-ripple-surface--accent:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--accent:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface--accent.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface--accent--activated::before{opacity:0.12;opacity:var(--mdc-ripple-activated-opacity, 0.12)}.mdc-ripple-surface--accent--activated::before,.mdc-ripple-surface--accent--activated::after{background-color:#018786;background-color:var(--mdc-ripple-color, var(--mdc-theme-secondary, #018786))}.mdc-ripple-surface--accent--activated:hover::before,.mdc-ripple-surface--accent--activated.mdc-ripple-surface--hover::before{opacity:0.16;opacity:var(--mdc-ripple-hover-opacity, 0.16)}.mdc-ripple-surface--accent--activated.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--accent--activated:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-focus-opacity, 0.24)}.mdc-ripple-surface--accent--activated:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--accent--activated:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-press-opacity, 0.24)}.mdc-ripple-surface--accent--activated.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity, 0.24)}.mdc-ripple-surface--accent--selected::before{opacity:0.08;opacity:var(--mdc-ripple-selected-opacity, 0.08)}.mdc-ripple-surface--accent--selected::before,.mdc-ripple-surface--accent--selected::after{background-color:#018786;background-color:var(--mdc-ripple-color, var(--mdc-theme-secondary, #018786))}.mdc-ripple-surface--accent--selected:hover::before,.mdc-ripple-surface--accent--selected.mdc-ripple-surface--hover::before{opacity:0.12;opacity:var(--mdc-ripple-hover-opacity, 0.12)}.mdc-ripple-surface--accent--selected.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--accent--selected:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.2;opacity:var(--mdc-ripple-focus-opacity, 0.2)}.mdc-ripple-surface--accent--selected:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--accent--selected:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.2;opacity:var(--mdc-ripple-press-opacity, 0.2)}.mdc-ripple-surface--accent--selected.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity, 0.2)}.mdc-ripple-surface--disabled{opacity:0}.mdc-ripple-surface--internal-use-state-layer-custom-properties::before,.mdc-ripple-surface--internal-use-state-layer-custom-properties::after{background-color:#000;background-color:var(--mdc-ripple-hover-state-layer-color, #000)}.mdc-ripple-surface--internal-use-state-layer-custom-properties:hover::before,.mdc-ripple-surface--internal-use-state-layer-custom-properties.mdc-ripple-surface--hover::before{opacity:0.04;opacity:var(--mdc-ripple-hover-state-layer-opacity, 0.04)}.mdc-ripple-surface--internal-use-state-layer-custom-properties.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--internal-use-state-layer-custom-properties:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-state-layer-opacity, 0.12)}.mdc-ripple-surface--internal-use-state-layer-custom-properties:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--internal-use-state-layer-custom-properties:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-pressed-state-layer-opacity, 0.12)}.mdc-ripple-surface--internal-use-state-layer-custom-properties.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-pressed-state-layer-opacity, 0.12)}`;
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let Di = class extends C {
};
Di.styles = [sa];
Di = g([
  hn("mwc-ripple")
], Di);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function oa(s, t, e) {
  const i = s.constructor;
  if (!e) {
    const l = `__${t}`;
    if (e = i.getPropertyDescriptor(t, l), !e)
      throw new Error("@ariaProperty must be used after a @property decorator");
  }
  const r = e;
  let n = "";
  if (!r.set)
    throw new Error(`@ariaProperty requires a setter for ${t}`);
  if (s.dispatchWizEvent)
    return e;
  const o = {
    configurable: !0,
    enumerable: !0,
    set(l) {
      if (n === "") {
        const a = i.getPropertyOptions(t);
        n = typeof a.attribute == "string" ? a.attribute : t;
      }
      this.hasAttribute(n) && this.removeAttribute(n), r.set.call(this, l);
    }
  };
  return r.get && (o.get = function() {
    return r.get.call(this);
  }), o;
}
function na(s, t, e) {
  if (t !== void 0)
    return oa(s, t, e);
  throw new Error("@ariaProperty only supports TypeScript Decorators");
}
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class aa {
  constructor(t) {
    this.startPress = (e) => {
      t().then((i) => {
        i && i.startPress(e);
      });
    }, this.endPress = () => {
      t().then((e) => {
        e && e.endPress();
      });
    }, this.startFocus = () => {
      t().then((e) => {
        e && e.startFocus();
      });
    }, this.endFocus = () => {
      t().then((e) => {
        e && e.endFocus();
      });
    }, this.startHover = () => {
      t().then((e) => {
        e && e.startHover();
      });
    }, this.endHover = () => {
      t().then((e) => {
        e && e.endHover();
      });
    };
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const He = window, rr = He.ShadowRoot && (He.ShadyCSS === void 0 || He.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, sr = Symbol(), cs = /* @__PURE__ */ new WeakMap();
let no = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== sr) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (rr && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = cs.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && cs.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const la = (s) => new no(typeof s == "string" ? s : s + "", void 0, sr), ca = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new no(e, s, sr);
}, da = (s, t) => {
  rr ? s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet) : t.forEach((e) => {
    const i = document.createElement("style"), r = He.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  });
}, ds = rr ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return la(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var vi;
const Ne = window, ps = Ne.trustedTypes, pa = ps ? ps.emptyScript : "", hs = Ne.reactiveElementPolyfillSupport, Ni = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? pa : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, ao = (s, t) => t !== s && (t == t || s == s), gi = { attribute: !0, type: String, converter: Ni, reflect: !1, hasChanged: ao }, Ii = "finalized";
let Mt = class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
  }
  static addInitializer(t) {
    var e;
    this.finalize(), ((e = this.h) !== null && e !== void 0 ? e : this.h = []).push(t);
  }
  static get observedAttributes() {
    this.finalize();
    const t = [];
    return this.elementProperties.forEach((e, i) => {
      const r = this._$Ep(i, e);
      r !== void 0 && (this._$Ev.set(r, i), t.push(r));
    }), t;
  }
  static createProperty(t, e = gi) {
    if (e.state && (e.attribute = !1), this.finalize(), this.elementProperties.set(t, e), !e.noAccessor && !this.prototype.hasOwnProperty(t)) {
      const i = typeof t == "symbol" ? Symbol() : "__" + t, r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && Object.defineProperty(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    return { get() {
      return this[e];
    }, set(r) {
      const n = this[t];
      this[e] = r, this.requestUpdate(t, n, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) || gi;
  }
  static finalize() {
    if (this.hasOwnProperty(Ii)) return !1;
    this[Ii] = !0;
    const t = Object.getPrototypeOf(this);
    if (t.finalize(), t.h !== void 0 && (this.h = [...t.h]), this.elementProperties = new Map(t.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const e = this.properties, i = [...Object.getOwnPropertyNames(e), ...Object.getOwnPropertySymbols(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), !0;
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(ds(r));
    } else t !== void 0 && e.push(ds(t));
    return e;
  }
  static _$Ep(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  _$Eu() {
    var t;
    this._$E_ = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), (t = this.constructor.h) === null || t === void 0 || t.forEach((e) => e(this));
  }
  addController(t) {
    var e, i;
    ((e = this._$ES) !== null && e !== void 0 ? e : this._$ES = []).push(t), this.renderRoot !== void 0 && this.isConnected && ((i = t.hostConnected) === null || i === void 0 || i.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.splice(this._$ES.indexOf(t) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((t, e) => {
      this.hasOwnProperty(e) && (this._$Ei.set(e, this[e]), delete this[e]);
    });
  }
  createRenderRoot() {
    var t;
    const e = (t = this.shadowRoot) !== null && t !== void 0 ? t : this.attachShadow(this.constructor.shadowRootOptions);
    return da(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var t;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) === null || i === void 0 ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) === null || i === void 0 ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$EO(t, e, i = gi) {
    var r;
    const n = this.constructor._$Ep(t, i);
    if (n !== void 0 && i.reflect === !0) {
      const o = (((r = i.converter) === null || r === void 0 ? void 0 : r.toAttribute) !== void 0 ? i.converter : Ni).toAttribute(e, i.type);
      this._$El = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$El = null;
    }
  }
  _$AK(t, e) {
    var i;
    const r = this.constructor, n = r._$Ev.get(t);
    if (n !== void 0 && this._$El !== n) {
      const o = r.getPropertyOptions(n), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((i = o.converter) === null || i === void 0 ? void 0 : i.fromAttribute) !== void 0 ? o.converter : Ni;
      this._$El = n, this[n] = l.fromAttribute(e, o.type), this._$El = null;
    }
  }
  requestUpdate(t, e, i) {
    let r = !0;
    t !== void 0 && (((i = i || this.constructor.getPropertyOptions(t)).hasChanged || ao)(this[t], e) ? (this._$AL.has(t) || this._$AL.set(t, e), i.reflect === !0 && this._$El !== t && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t, i))) : r = !1), !this.isUpdatePending && r && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = !0;
    try {
      await this._$E_;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t;
    if (!this.isUpdatePending) return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((r, n) => this[n] = r), this._$Ei = void 0);
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), (t = this._$ES) === null || t === void 0 || t.forEach((r) => {
        var n;
        return (n = r.hostUpdate) === null || n === void 0 ? void 0 : n.call(r);
      }), this.update(i)) : this._$Ek();
    } catch (r) {
      throw e = !1, this._$Ek(), r;
    }
    e && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.forEach((i) => {
      var r;
      return (r = i.hostUpdated) === null || r === void 0 ? void 0 : r.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$Ek() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$EC !== void 0 && (this._$EC.forEach((e, i) => this._$EO(i, this[i], e)), this._$EC = void 0), this._$Ek();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
Mt[Ii] = !0, Mt.elementProperties = /* @__PURE__ */ new Map(), Mt.elementStyles = [], Mt.shadowRootOptions = { mode: "open" }, hs == null || hs({ ReactiveElement: Mt }), ((vi = Ne.reactiveElementVersions) !== null && vi !== void 0 ? vi : Ne.reactiveElementVersions = []).push("1.6.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var _i;
const Ie = window, Zt = Ie.trustedTypes, us = Zt ? Zt.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Bi = "$lit$", tt = `lit$${(Math.random() + "").slice(9)}$`, lo = "?" + tt, ha = `<${lo}>`, Ct = document, ve = () => Ct.createComment(""), ge = (s) => s === null || typeof s != "object" && typeof s != "function", co = Array.isArray, ua = (s) => co(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", yi = `[ 	
\f\r]`, Yt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ms = /-->/g, fs = />/g, ft = RegExp(`>|${yi}(?:([^\\s"'>=/]+)(${yi}*=${yi}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), vs = /'/g, gs = /"/g, po = /^(?:script|style|textarea|title)$/i, ma = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), we = ma(1), Et = Symbol.for("lit-noChange"), w = Symbol.for("lit-nothing"), _s = /* @__PURE__ */ new WeakMap(), bt = Ct.createTreeWalker(Ct, 129, null, !1);
function ho(s, t) {
  if (!Array.isArray(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return us !== void 0 ? us.createHTML(t) : t;
}
const fa = (s, t) => {
  const e = s.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : "", o = Yt;
  for (let l = 0; l < e; l++) {
    const a = s[l];
    let c, p, d = -1, h = 0;
    for (; h < a.length && (o.lastIndex = h, p = o.exec(a), p !== null); ) h = o.lastIndex, o === Yt ? p[1] === "!--" ? o = ms : p[1] !== void 0 ? o = fs : p[2] !== void 0 ? (po.test(p[2]) && (r = RegExp("</" + p[2], "g")), o = ft) : p[3] !== void 0 && (o = ft) : o === ft ? p[0] === ">" ? (o = r ?? Yt, d = -1) : p[1] === void 0 ? d = -2 : (d = o.lastIndex - p[2].length, c = p[1], o = p[3] === void 0 ? ft : p[3] === '"' ? gs : vs) : o === gs || o === vs ? o = ft : o === ms || o === fs ? o = Yt : (o = ft, r = void 0);
    const m = o === ft && s[l + 1].startsWith("/>") ? " " : "";
    n += o === Yt ? a + ha : d >= 0 ? (i.push(c), a.slice(0, d) + Bi + a.slice(d) + tt + m) : a + tt + (d === -2 ? (i.push(void 0), l) : m);
  }
  return [ho(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : "")), i];
};
class _e {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, a = this.parts, [c, p] = fa(t, e);
    if (this.el = _e.createElement(c, i), bt.currentNode = this.el.content, e === 2) {
      const d = this.el.content, h = d.firstChild;
      h.remove(), d.append(...h.childNodes);
    }
    for (; (r = bt.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) {
          const d = [];
          for (const h of r.getAttributeNames()) if (h.endsWith(Bi) || h.startsWith(tt)) {
            const m = p[o++];
            if (d.push(h), m !== void 0) {
              const _ = r.getAttribute(m.toLowerCase() + Bi).split(tt), v = /([.?@])?(.*)/.exec(m);
              a.push({ type: 1, index: n, name: v[2], strings: _, ctor: v[1] === "." ? ga : v[1] === "?" ? ya : v[1] === "@" ? ba : We });
            } else a.push({ type: 6, index: n });
          }
          for (const h of d) r.removeAttribute(h);
        }
        if (po.test(r.tagName)) {
          const d = r.textContent.split(tt), h = d.length - 1;
          if (h > 0) {
            r.textContent = Zt ? Zt.emptyScript : "";
            for (let m = 0; m < h; m++) r.append(d[m], ve()), bt.nextNode(), a.push({ type: 2, index: ++n });
            r.append(d[h], ve());
          }
        }
      } else if (r.nodeType === 8) if (r.data === lo) a.push({ type: 2, index: n });
      else {
        let d = -1;
        for (; (d = r.data.indexOf(tt, d + 1)) !== -1; ) a.push({ type: 7, index: n }), d += tt.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = Ct.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Gt(s, t, e = s, i) {
  var r, n, o, l;
  if (t === Et) return t;
  let a = i !== void 0 ? (r = e._$Co) === null || r === void 0 ? void 0 : r[i] : e._$Cl;
  const c = ge(t) ? void 0 : t._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== c && ((n = a == null ? void 0 : a._$AO) === null || n === void 0 || n.call(a, !1), c === void 0 ? a = void 0 : (a = new c(s), a._$AT(s, e, i)), i !== void 0 ? ((o = (l = e)._$Co) !== null && o !== void 0 ? o : l._$Co = [])[i] = a : e._$Cl = a), a !== void 0 && (t = Gt(s, a._$AS(s, t.values), a, i)), t;
}
class va {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    var e;
    const { el: { content: i }, parts: r } = this._$AD, n = ((e = t == null ? void 0 : t.creationScope) !== null && e !== void 0 ? e : Ct).importNode(i, !0);
    bt.currentNode = n;
    let o = bt.nextNode(), l = 0, a = 0, c = r[0];
    for (; c !== void 0; ) {
      if (l === c.index) {
        let p;
        c.type === 2 ? p = new ye(o, o.nextSibling, this, t) : c.type === 1 ? p = new c.ctor(o, c.name, c.strings, this, t) : c.type === 6 && (p = new $a(o, this, t)), this._$AV.push(p), c = r[++a];
      }
      l !== (c == null ? void 0 : c.index) && (o = bt.nextNode(), l++);
    }
    return bt.currentNode = Ct, n;
  }
  v(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class ye {
  constructor(t, e, i, r) {
    var n;
    this.type = 2, this._$AH = w, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cp = (n = r == null ? void 0 : r.isConnected) === null || n === void 0 || n;
  }
  get _$AU() {
    var t, e;
    return (e = (t = this._$AM) === null || t === void 0 ? void 0 : t._$AU) !== null && e !== void 0 ? e : this._$Cp;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = Gt(this, t, e), ge(t) ? t === w || t == null || t === "" ? (this._$AH !== w && this._$AR(), this._$AH = w) : t !== this._$AH && t !== Et && this._(t) : t._$litType$ !== void 0 ? this.g(t) : t.nodeType !== void 0 ? this.$(t) : ua(t) ? this.T(t) : this._(t);
  }
  k(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  $(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.k(t));
  }
  _(t) {
    this._$AH !== w && ge(this._$AH) ? this._$AA.nextSibling.data = t : this.$(Ct.createTextNode(t)), this._$AH = t;
  }
  g(t) {
    var e;
    const { values: i, _$litType$: r } = t, n = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = _e.createElement(ho(r.h, r.h[0]), this.options)), r);
    if (((e = this._$AH) === null || e === void 0 ? void 0 : e._$AD) === n) this._$AH.v(i);
    else {
      const o = new va(n, this), l = o.u(this.options);
      o.v(i), this.$(l), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = _s.get(t.strings);
    return e === void 0 && _s.set(t.strings, e = new _e(t)), e;
  }
  T(t) {
    co(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const n of t) r === e.length ? e.push(i = new ye(this.k(ve()), this.k(ve()), this, this.options)) : i = e[r], i._$AI(n), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, !1, !0, e); t && t !== this._$AB; ) {
      const r = t.nextSibling;
      t.remove(), t = r;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cp = t, (e = this._$AP) === null || e === void 0 || e.call(this, t));
  }
}
class We {
  constructor(t, e, i, r, n) {
    this.type = 1, this._$AH = w, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = w;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t, e = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = Gt(this, t, e, 0), o = !ge(t) || t !== this._$AH && t !== Et, o && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = n[0], a = 0; a < n.length - 1; a++) c = Gt(this, l[i + a], e, a), c === Et && (c = this._$AH[a]), o || (o = !ge(c) || c !== this._$AH[a]), c === w ? t = w : t !== w && (t += (c ?? "") + n[a + 1]), this._$AH[a] = c;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === w ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ga extends We {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === w ? void 0 : t;
  }
}
const _a = Zt ? Zt.emptyScript : "";
class ya extends We {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    t && t !== w ? this.element.setAttribute(this.name, _a) : this.element.removeAttribute(this.name);
  }
}
class ba extends We {
  constructor(t, e, i, r, n) {
    super(t, e, i, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    var i;
    if ((t = (i = Gt(this, t, e, 0)) !== null && i !== void 0 ? i : w) === Et) return;
    const r = this._$AH, n = t === w && r !== w || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, o = t !== w && (r === w || n);
    n && this.element.removeEventListener(this.name, this, r), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (e = this.options) === null || e === void 0 ? void 0 : e.host) !== null && i !== void 0 ? i : this.element, t) : this._$AH.handleEvent(t);
  }
}
class $a {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Gt(this, t);
  }
}
const ys = Ie.litHtmlPolyfillSupport;
ys == null || ys(_e, ye), ((_i = Ie.litHtmlVersions) !== null && _i !== void 0 ? _i : Ie.litHtmlVersions = []).push("2.8.0");
const xa = (s, t, e) => {
  var i, r;
  const n = (i = e == null ? void 0 : e.renderBefore) !== null && i !== void 0 ? i : t;
  let o = n._$litPart$;
  if (o === void 0) {
    const l = (r = e == null ? void 0 : e.renderBefore) !== null && r !== void 0 ? r : null;
    n._$litPart$ = o = new ye(t.insertBefore(ve(), l), l, void 0, e ?? {});
  }
  return o._$AI(s), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var bi, $i;
class oe extends Mt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t, e;
    const i = super.createRenderRoot();
    return (t = (e = this.renderOptions).renderBefore) !== null && t !== void 0 || (e.renderBefore = i.firstChild), i;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = xa(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!1);
  }
  render() {
    return Et;
  }
}
oe.finalized = !0, oe._$litElement$ = !0, (bi = globalThis.litElementHydrateSupport) === null || bi === void 0 || bi.call(globalThis, { LitElement: oe });
const bs = globalThis.litElementPolyfillSupport;
bs == null || bs({ LitElement: oe });
(($i = globalThis.litElementVersions) !== null && $i !== void 0 ? $i : globalThis.litElementVersions = []).push("3.3.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wa = { ATTRIBUTE: 1 }, Aa = (s) => (...t) => ({ _$litDirective$: s, values: t });
class Sa {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, i) {
    this._$Ct = t, this._$AM = e, this._$Ci = i;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $s = Aa(class extends Sa {
  constructor(s) {
    var t;
    if (super(s), s.type !== wa.ATTRIBUTE || s.name !== "class" || ((t = s.strings) === null || t === void 0 ? void 0 : t.length) > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(s) {
    return " " + Object.keys(s).filter((t) => s[t]).join(" ") + " ";
  }
  update(s, [t]) {
    var e, i;
    if (this.it === void 0) {
      this.it = /* @__PURE__ */ new Set(), s.strings !== void 0 && (this.nt = new Set(s.strings.join(" ").split(/\s/).filter((n) => n !== "")));
      for (const n in t) t[n] && !(!((e = this.nt) === null || e === void 0) && e.has(n)) && this.it.add(n);
      return this.render(t);
    }
    const r = s.element.classList;
    this.it.forEach((n) => {
      n in t || (r.remove(n), this.it.delete(n));
    });
    for (const n in t) {
      const o = !!t[n];
      o === this.it.has(n) || !((i = this.nt) === null || i === void 0) && i.has(n) || (o ? (r.add(n), this.it.add(n)) : (r.remove(n), this.it.delete(n)));
    }
    return Et;
  }
});
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ca = (s) => s ?? w;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class U extends oe {
  constructor() {
    super(...arguments), this.raised = !1, this.unelevated = !1, this.outlined = !1, this.dense = !1, this.disabled = !1, this.trailingIcon = !1, this.fullwidth = !1, this.icon = "", this.label = "", this.expandContent = !1, this.shouldRenderRipple = !1, this.rippleHandlers = new aa(() => (this.shouldRenderRipple = !0, this.ripple));
  }
  /** @soyTemplate */
  renderOverlay() {
    return we``;
  }
  /** @soyTemplate */
  renderRipple() {
    const t = this.raised || this.unelevated;
    return this.shouldRenderRipple ? we`<mwc-ripple class="ripple" .primary="${!t}" .disabled="${this.disabled}"></mwc-ripple>` : "";
  }
  focus() {
    const t = this.buttonElement;
    t && (this.rippleHandlers.startFocus(), t.focus());
  }
  blur() {
    const t = this.buttonElement;
    t && (this.rippleHandlers.endFocus(), t.blur());
  }
  /** @soyTemplate */
  getRenderClasses() {
    return {
      "mdc-button--raised": this.raised,
      "mdc-button--unelevated": this.unelevated,
      "mdc-button--outlined": this.outlined,
      "mdc-button--dense": this.dense
    };
  }
  /**
   * @soyTemplate
   * @soyAttributes buttonAttributes: #button
   * @soyClasses buttonClasses: #button
   */
  render() {
    return we`
      <button
          id="button"
          class="mdc-button ${$s(this.getRenderClasses())}"
          ?disabled="${this.disabled}"
          aria-label="${this.label || this.icon}"
          aria-haspopup="${Ca(this.ariaHasPopup)}"
          @focus="${this.handleRippleFocus}"
          @blur="${this.handleRippleBlur}"
          @mousedown="${this.handleRippleActivate}"
          @mouseenter="${this.handleRippleMouseEnter}"
          @mouseleave="${this.handleRippleMouseLeave}"
          @touchstart="${this.handleRippleActivate}"
          @touchend="${this.handleRippleDeactivate}"
          @touchcancel="${this.handleRippleDeactivate}">
        ${this.renderOverlay()}
        ${this.renderRipple()}
        <span class="leading-icon">
          <slot name="icon">
            ${this.icon && !this.trailingIcon ? this.renderIcon() : ""}
          </slot>
        </span>
        <span class="mdc-button__label">${this.label}</span>
        <span class="slot-container ${$s({
      flex: this.expandContent
    })}">
          <slot></slot>
        </span>
        <span class="trailing-icon">
          <slot name="trailingIcon">
            ${this.icon && this.trailingIcon ? this.renderIcon() : ""}
          </slot>
        </span>
      </button>`;
  }
  /** @soyTemplate */
  renderIcon() {
    return we`
    <mwc-icon class="mdc-button__icon">
      ${this.icon}
    </mwc-icon>`;
  }
  handleRippleActivate(t) {
    const e = () => {
      window.removeEventListener("mouseup", e), this.handleRippleDeactivate();
    };
    window.addEventListener("mouseup", e), this.rippleHandlers.startPress(t);
  }
  handleRippleDeactivate() {
    this.rippleHandlers.endPress();
  }
  handleRippleMouseEnter() {
    this.rippleHandlers.startHover();
  }
  handleRippleMouseLeave() {
    this.rippleHandlers.endHover();
  }
  handleRippleFocus() {
    this.rippleHandlers.startFocus();
  }
  handleRippleBlur() {
    this.rippleHandlers.endFocus();
  }
}
U.shadowRootOptions = { mode: "open", delegatesFocus: !0 };
g([
  na,
  L({ type: String, attribute: "aria-haspopup" })
], U.prototype, "ariaHasPopup", void 0);
g([
  L({ type: Boolean, reflect: !0 })
], U.prototype, "raised", void 0);
g([
  L({ type: Boolean, reflect: !0 })
], U.prototype, "unelevated", void 0);
g([
  L({ type: Boolean, reflect: !0 })
], U.prototype, "outlined", void 0);
g([
  L({ type: Boolean })
], U.prototype, "dense", void 0);
g([
  L({ type: Boolean, reflect: !0 })
], U.prototype, "disabled", void 0);
g([
  L({ type: Boolean, attribute: "trailingicon" })
], U.prototype, "trailingIcon", void 0);
g([
  L({ type: Boolean, reflect: !0 })
], U.prototype, "fullwidth", void 0);
g([
  L({ type: String })
], U.prototype, "icon", void 0);
g([
  L({ type: String })
], U.prototype, "label", void 0);
g([
  L({ type: Boolean })
], U.prototype, "expandContent", void 0);
g([
  qo("#button")
], U.prototype, "buttonElement", void 0);
g([
  Zo("mwc-ripple")
], U.prototype, "ripple", void 0);
g([
  Fo()
], U.prototype, "shouldRenderRipple", void 0);
g([
  Wo({ passive: !0 })
], U.prototype, "handleRippleActivate", null);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-LIcense-Identifier: Apache-2.0
 */
const Ea = ca`.mdc-button{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-button-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-button-font-size, 0.875rem);line-height:2.25rem;line-height:var(--mdc-typography-button-line-height, 2.25rem);font-weight:500;font-weight:var(--mdc-typography-button-font-weight, 500);letter-spacing:0.0892857143em;letter-spacing:var(--mdc-typography-button-letter-spacing, 0.0892857143em);text-decoration:none;text-decoration:var(--mdc-typography-button-text-decoration, none);text-transform:uppercase;text-transform:var(--mdc-typography-button-text-transform, uppercase)}.mdc-touch-target-wrapper{display:inline}.mdc-elevation-overlay{position:absolute;border-radius:inherit;pointer-events:none;opacity:0;opacity:var(--mdc-elevation-overlay-opacity, 0);transition:opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);background-color:#fff;background-color:var(--mdc-elevation-overlay-color, #fff)}.mdc-button{position:relative;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:64px;border:none;outline:none;line-height:inherit;user-select:none;-webkit-appearance:none;overflow:visible;vertical-align:middle;background:transparent}.mdc-button .mdc-elevation-overlay{width:100%;height:100%;top:0;left:0}.mdc-button::-moz-focus-inner{padding:0;border:0}.mdc-button:active{outline:none}.mdc-button:hover{cursor:pointer}.mdc-button:disabled{cursor:default;pointer-events:none}.mdc-button .mdc-button__icon{margin-left:0;margin-right:8px;display:inline-block;position:relative;vertical-align:top}[dir=rtl] .mdc-button .mdc-button__icon,.mdc-button .mdc-button__icon[dir=rtl]{margin-left:8px;margin-right:0}.mdc-button .mdc-button__label{position:relative}.mdc-button .mdc-button__focus-ring{display:none}@media screen and (forced-colors: active){.mdc-button.mdc-ripple-upgraded--background-focused .mdc-button__focus-ring,.mdc-button:not(.mdc-ripple-upgraded):focus .mdc-button__focus-ring{pointer-events:none;border:2px solid transparent;border-radius:6px;box-sizing:content-box;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);height:calc( 100% + 4px );width:calc( 100% + 4px );display:block}}@media screen and (forced-colors: active)and (forced-colors: active){.mdc-button.mdc-ripple-upgraded--background-focused .mdc-button__focus-ring,.mdc-button:not(.mdc-ripple-upgraded):focus .mdc-button__focus-ring{border-color:CanvasText}}@media screen and (forced-colors: active){.mdc-button.mdc-ripple-upgraded--background-focused .mdc-button__focus-ring::after,.mdc-button:not(.mdc-ripple-upgraded):focus .mdc-button__focus-ring::after{content:"";border:2px solid transparent;border-radius:8px;display:block;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);height:calc(100% + 4px);width:calc(100% + 4px)}}@media screen and (forced-colors: active)and (forced-colors: active){.mdc-button.mdc-ripple-upgraded--background-focused .mdc-button__focus-ring::after,.mdc-button:not(.mdc-ripple-upgraded):focus .mdc-button__focus-ring::after{border-color:CanvasText}}.mdc-button .mdc-button__touch{position:absolute;top:50%;height:48px;left:0;right:0;transform:translateY(-50%)}.mdc-button__label+.mdc-button__icon{margin-left:8px;margin-right:0}[dir=rtl] .mdc-button__label+.mdc-button__icon,.mdc-button__label+.mdc-button__icon[dir=rtl]{margin-left:0;margin-right:8px}svg.mdc-button__icon{fill:currentColor}.mdc-button--touch{margin-top:6px;margin-bottom:6px}.mdc-button{padding:0 8px 0 8px}.mdc-button--unelevated{transition:box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);padding:0 16px 0 16px}.mdc-button--unelevated.mdc-button--icon-trailing{padding:0 12px 0 16px}.mdc-button--unelevated.mdc-button--icon-leading{padding:0 16px 0 12px}.mdc-button--raised{transition:box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);padding:0 16px 0 16px}.mdc-button--raised.mdc-button--icon-trailing{padding:0 12px 0 16px}.mdc-button--raised.mdc-button--icon-leading{padding:0 16px 0 12px}.mdc-button--outlined{border-style:solid;transition:border 280ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-button--outlined .mdc-button__ripple{border-style:solid;border-color:transparent}.mdc-button{height:36px;border-radius:4px;border-radius:var(--mdc-shape-small, 4px)}.mdc-button:not(:disabled){color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}.mdc-button:disabled{color:rgba(0, 0, 0, 0.38)}.mdc-button .mdc-button__icon{font-size:1.125rem;width:1.125rem;height:1.125rem}.mdc-button .mdc-button__ripple{border-radius:4px;border-radius:var(--mdc-shape-small, 4px)}.mdc-button--raised,.mdc-button--unelevated{height:36px;border-radius:4px;border-radius:var(--mdc-shape-small, 4px)}.mdc-button--raised:not(:disabled),.mdc-button--unelevated:not(:disabled){background-color:#6200ee;background-color:var(--mdc-theme-primary, #6200ee)}.mdc-button--raised:disabled,.mdc-button--unelevated:disabled{background-color:rgba(0, 0, 0, 0.12)}.mdc-button--raised:not(:disabled),.mdc-button--unelevated:not(:disabled){color:#fff;color:var(--mdc-theme-on-primary, #fff)}.mdc-button--raised:disabled,.mdc-button--unelevated:disabled{color:rgba(0, 0, 0, 0.38)}.mdc-button--raised .mdc-button__icon,.mdc-button--unelevated .mdc-button__icon{font-size:1.125rem;width:1.125rem;height:1.125rem}.mdc-button--raised .mdc-button__ripple,.mdc-button--unelevated .mdc-button__ripple{border-radius:4px;border-radius:var(--mdc-shape-small, 4px)}.mdc-button--outlined{height:36px;border-radius:4px;border-radius:var(--mdc-shape-small, 4px);padding:0 15px 0 15px;border-width:1px}.mdc-button--outlined:not(:disabled){color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}.mdc-button--outlined:disabled{color:rgba(0, 0, 0, 0.38)}.mdc-button--outlined .mdc-button__icon{font-size:1.125rem;width:1.125rem;height:1.125rem}.mdc-button--outlined .mdc-button__ripple{border-radius:4px;border-radius:var(--mdc-shape-small, 4px)}.mdc-button--outlined:not(:disabled){border-color:rgba(0, 0, 0, 0.12)}.mdc-button--outlined:disabled{border-color:rgba(0, 0, 0, 0.12)}.mdc-button--outlined.mdc-button--icon-trailing{padding:0 11px 0 15px}.mdc-button--outlined.mdc-button--icon-leading{padding:0 15px 0 11px}.mdc-button--outlined .mdc-button__ripple{top:-1px;left:-1px;bottom:-1px;right:-1px;border-width:1px}.mdc-button--outlined .mdc-button__touch{left:calc(-1 * 1px);width:calc(100% + 2 * 1px)}.mdc-button--raised{box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 1px 5px 0px rgba(0,0,0,.12);transition:box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-button--raised:hover,.mdc-button--raised:focus{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12)}.mdc-button--raised:active{box-shadow:0px 5px 5px -3px rgba(0, 0, 0, 0.2),0px 8px 10px 1px rgba(0, 0, 0, 0.14),0px 3px 14px 2px rgba(0,0,0,.12)}.mdc-button--raised:disabled{box-shadow:0px 0px 0px 0px rgba(0, 0, 0, 0.2),0px 0px 0px 0px rgba(0, 0, 0, 0.14),0px 0px 0px 0px rgba(0,0,0,.12)}:host{display:inline-flex;outline:none;-webkit-tap-highlight-color:transparent;vertical-align:top}:host([fullwidth]){width:100%}:host([raised]),:host([unelevated]){--mdc-ripple-color:#fff;--mdc-ripple-focus-opacity:0.24;--mdc-ripple-hover-opacity:0.08;--mdc-ripple-press-opacity:0.24}.trailing-icon ::slotted(*),.trailing-icon .mdc-button__icon,.leading-icon ::slotted(*),.leading-icon .mdc-button__icon{margin-left:0;margin-right:8px;display:inline-block;position:relative;vertical-align:top;font-size:1.125rem;height:1.125rem;width:1.125rem}[dir=rtl] .trailing-icon ::slotted(*),[dir=rtl] .trailing-icon .mdc-button__icon,[dir=rtl] .leading-icon ::slotted(*),[dir=rtl] .leading-icon .mdc-button__icon,.trailing-icon ::slotted(*[dir=rtl]),.trailing-icon .mdc-button__icon[dir=rtl],.leading-icon ::slotted(*[dir=rtl]),.leading-icon .mdc-button__icon[dir=rtl]{margin-left:8px;margin-right:0}.trailing-icon ::slotted(*),.trailing-icon .mdc-button__icon{margin-left:8px;margin-right:0}[dir=rtl] .trailing-icon ::slotted(*),[dir=rtl] .trailing-icon .mdc-button__icon,.trailing-icon ::slotted(*[dir=rtl]),.trailing-icon .mdc-button__icon[dir=rtl]{margin-left:0;margin-right:8px}.slot-container{display:inline-flex;align-items:center;justify-content:center}.slot-container.flex{flex:auto}.mdc-button{flex:auto;overflow:hidden;padding-left:8px;padding-left:var(--mdc-button-horizontal-padding, 8px);padding-right:8px;padding-right:var(--mdc-button-horizontal-padding, 8px)}.mdc-button--raised{box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);box-shadow:var(--mdc-button-raised-box-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12))}.mdc-button--raised:focus{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);box-shadow:var(--mdc-button-raised-box-shadow-focus, var(--mdc-button-raised-box-shadow-hover, 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)))}.mdc-button--raised:hover{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);box-shadow:var(--mdc-button-raised-box-shadow-hover, 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12))}.mdc-button--raised:active{box-shadow:0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);box-shadow:var(--mdc-button-raised-box-shadow-active, 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12))}.mdc-button--raised:disabled{box-shadow:0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12);box-shadow:var(--mdc-button-raised-box-shadow-disabled, 0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12))}.mdc-button--raised,.mdc-button--unelevated{padding-left:16px;padding-left:var(--mdc-button-horizontal-padding, 16px);padding-right:16px;padding-right:var(--mdc-button-horizontal-padding, 16px)}.mdc-button--outlined{border-width:1px;border-width:var(--mdc-button-outline-width, 1px);padding-left:calc(16px - 1px);padding-left:calc(var(--mdc-button-horizontal-padding, 16px) - var(--mdc-button-outline-width, 1px));padding-right:calc(16px - 1px);padding-right:calc(var(--mdc-button-horizontal-padding, 16px) - var(--mdc-button-outline-width, 1px))}.mdc-button--outlined:not(:disabled){border-color:rgba(0, 0, 0, 0.12);border-color:var(--mdc-button-outline-color, rgba(0, 0, 0, 0.12))}.mdc-button--outlined .ripple{top:calc(-1 * 1px);top:calc(-1 * var(--mdc-button-outline-width, 1px));left:calc(-1 * 1px);left:calc(-1 * var(--mdc-button-outline-width, 1px));right:initial;right:initial;border-width:1px;border-width:var(--mdc-button-outline-width, 1px);border-style:solid;border-color:transparent}[dir=rtl] .mdc-button--outlined .ripple,.mdc-button--outlined .ripple[dir=rtl]{left:initial;left:initial;right:calc(-1 * 1px);right:calc(-1 * var(--mdc-button-outline-width, 1px))}.mdc-button--dense{height:28px;margin-top:0;margin-bottom:0}.mdc-button--dense .mdc-button__touch{height:100%}:host([disabled]){pointer-events:none}:host([disabled]) .mdc-button{color:rgba(0, 0, 0, 0.38);color:var(--mdc-button-disabled-ink-color, rgba(0, 0, 0, 0.38))}:host([disabled]) .mdc-button--raised,:host([disabled]) .mdc-button--unelevated{background-color:rgba(0, 0, 0, 0.12);background-color:var(--mdc-button-disabled-fill-color, rgba(0, 0, 0, 0.12))}:host([disabled]) .mdc-button--outlined{border-color:rgba(0, 0, 0, 0.12);border-color:var(--mdc-button-disabled-outline-color, rgba(0, 0, 0, 0.12))}`;
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let Li = class extends U {
};
Li.styles = [Ea];
Li = g([
  Bo("mwc-button")
], Li);
var ka = Object.defineProperty, $ = (s, t, e, i) => {
  for (var r = void 0, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = o(t, e, r) || r);
  return r && ka(t, e, r), r;
};
const cr = class cr extends I {
  constructor() {
    super(...arguments), this.allEntities = [], this._uniqueId = "", this._name = "", this._temperatureSensor = "", this._heaters = /* @__PURE__ */ new Set(), this._thermostats = /* @__PURE__ */ new Set(), this._coolers = /* @__PURE__ */ new Set(), this._windowSensors = /* @__PURE__ */ new Set(), this._presenceSensors = /* @__PURE__ */ new Set(), this._occupancyTimeout = 30, this._occupancySetbackTemp = 2, this._filterByArea = !0, this._zoneAreaId = null, this._zoneAreaName = null, this._circuits = [], this._selectedCircuitId = "", this._loading = !1, this._error = "", this._showDeleteDialog = !1;
  }
  async firstUpdated() {
    await this._loadConfig();
  }
  async _loadConfig() {
    var c, p, d;
    if (!this.hass || !this.zoneId) return;
    this._loading = !0, console.log("Loading config for zoneId:", this.zoneId), this._zoneAreaId = null, this._zoneAreaName = null, this._filterByArea = !1;
    const t = this.hass.states[this.zoneId];
    if (!t) {
      console.error("Zone state not found for:", this.zoneId), this._error = "Zone not found", this._loading = !1;
      return;
    }
    if (console.log("Zone Attributes:", t.attributes), t.attributes.unique_id)
      this._uniqueId = t.attributes.unique_id;
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
    if (this._uniqueId && !this._zoneAreaId && ((p = (c = this.hass.entities) == null ? void 0 : c[this.zoneId]) != null && p.area_id) && (this._zoneAreaId = this.hass.entities[this.zoneId].area_id, this._filterByArea = !0), this._zoneAreaId && ((d = this.hass.areas) != null && d[this._zoneAreaId]) && (this._zoneAreaName = this.hass.areas[this._zoneAreaId].name), !this._uniqueId) {
      this._error = "Could not determine Unique ID", this._loading = !1;
      return;
    }
    const e = t.attributes;
    this._name = e.friendly_name || "", this._temperatureSensor = e.temperature_sensor || e.sensor_entity_id || "";
    const i = e.heaters || (e.actuator_entity_id ? [e.actuator_entity_id] : []);
    this._heaters = new Set(i);
    const r = e.thermostats || [];
    this._thermostats = new Set(r);
    const n = e.coolers || [];
    this._coolers = new Set(n);
    const o = e.window_sensors || [];
    this._windowSensors = new Set(o);
    const l = e.presence_sensors || [];
    this._presenceSensors = new Set(l), e.occupancy_timeout_minutes !== void 0 && (this._occupancyTimeout = e.occupancy_timeout_minutes), e.occupancy_setback_temp !== void 0 && (this._occupancySetbackTemp = e.occupancy_setback_temp), console.log("Loaded Config:", {
      name: this._name,
      temp: this._temperatureSensor,
      heaters: this._heaters,
      thermostats: this._thermostats,
      coolers: this._coolers,
      presence: this._presenceSensors
    }), await this._fetchCircuits();
    const a = this._circuits.find(
      (h) => h.member_zones.includes(this._uniqueId)
    );
    this._selectedCircuitId = a ? a.id : "", this._loading = !1;
  }
  async _fetchCircuits() {
    try {
      this._circuits = await this.hass.callWS({
        type: "climate_dashboard/circuit/list"
      });
    } catch (t) {
      console.error("Failed to fetch circuits", t);
    }
  }
  _toggleSet(t, e) {
    t.has(e) ? t.delete(e) : t.add(e), this.requestUpdate();
  }
  _getEntityList(t) {
    let e = this.allEntities.filter((i) => t.includes(i.domain));
    return this._filterByArea && this._zoneAreaId && (e = e.filter((i) => i.area_id === this._zoneAreaId)), e;
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
        presence_sensors: Array.from(this._presenceSensors),
        occupancy_timeout_minutes: this._occupancyTimeout,
        occupancy_setback_temp: this._occupancySetbackTemp,
        circuit_ids: this._selectedCircuitId ? [this._selectedCircuitId] : []
      }), this._goBack();
    } catch (t) {
      alert("Update failed: " + t.message);
    }
  }
  async _deleteConfirm() {
    try {
      await this.hass.callWS({
        type: "climate_dashboard/delete",
        unique_id: this._uniqueId
      }), this._goBack();
    } catch (t) {
      console.error("[ZoneEditor] Delete failed:", t), alert("Delete failed: " + t.message);
    } finally {
      this._showDeleteDialog = !1;
    }
  }
  _goBack() {
    this.dispatchEvent(new CustomEvent("close"));
  }
  render() {
    if (this._loading) return u`<div class="card">Loading...</div>`;
    if (this._error) return u`<div class="card">Error: ${this._error}</div>`;
    const t = this._getEntityList(["climate", "switch"]), e = this._getEntityList(["climate"]);
    this._heaters.size > 0 && this._coolers.size > 0 && this._thermostats.clear();
    const i = this._getEntityList(["climate"]), r = this._getEntityList(["binary_sensor"]);
    let n = this.allEntities.filter(
      (o) => o.domain === "sensor" && o.device_class === "temperature" || o.domain === "climate"
    );
    return this._filterByArea && this._zoneAreaId && (n = n.filter(
      (o) => o.area_id === this._zoneAreaId
    )), u`
      <div class="card">
        <h2>
          Edit Zone: ${this._name}
          ${this._zoneAreaId ? u`
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
      (o) => u`
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
            ${n.map(
      (o) => u`
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
            ${t.map(
      (o) => u`
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
            ${e.map(
      (o) => u`
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

        ${this._heaters.size === 0 || this._coolers.size === 0 ? u`
              <div class="field">
                <label>Thermostats (Wall Dials)</label>
                <div class="checkbox-list">
                  ${i.map(
      (o) => u`
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
            ` : ""}

        <div class="field">
          <label>Window Sensors</label>
          <div class="checkbox-list">
            ${r.map(
      (o) => u`
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

        <h3>Occupancy Setback</h3>
        <div class="field">
          <label>Presence Sensors</label>
          <div class="checkbox-list">
            ${r.map(
      (o) => u`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._presenceSensors.has(o.entity_id)}
                    @change=${() => this._toggleSet(this._presenceSensors, o.entity_id)}
                  />
                  <span>${o.name || o.entity_id}</span>
                </div>
              `
    )}
          </div>
        </div>

        <div style="display: flex; gap: 16px;">
          <div class="field" style="flex: 1;">
            <label>Timeout (Minutes)</label>
            <input
              type="number"
              min="1"
              .value=${this._occupancyTimeout}
              @input=${(o) => this._occupancyTimeout = parseInt(o.target.value)}
            />
          </div>
          <div class="field" style="flex: 1;">
            <label>Setback Offset (°C)</label>
            <input
              type="number"
              step="0.5"
              .value=${this._occupancySetbackTemp}
              @input=${(o) => this._occupancySetbackTemp = parseFloat(o.target.value)}
            />
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
          <mwc-button
            slot="secondaryAction"
            dialogAction="cancel"
            @click=${() => this._showDeleteDialog = !1}
          >
            Cancel
          </mwc-button>
          <mwc-button
            slot="primaryAction"
            class="delete-confirm"
            @click=${this._deleteConfirm}
          >
            Delete
          </mwc-button>
        </ha-dialog>
      </div>
    `;
  }
};
cr.styles = st`
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
    .delete-confirm {
      --mdc-theme-primary: var(--error-color, #f44336);
    }
    .delete {
      background: var(--error-color, #f44336);
      color: white;
      margin-right: auto;
    }
  `;
let y = cr;
$([
  S({ attribute: !1 })
], y.prototype, "hass");
$([
  S({ attribute: !1 })
], y.prototype, "zoneId");
$([
  S({ attribute: !1 })
], y.prototype, "allEntities");
$([
  f()
], y.prototype, "_uniqueId");
$([
  f()
], y.prototype, "_name");
$([
  f()
], y.prototype, "_temperatureSensor");
$([
  f()
], y.prototype, "_heaters");
$([
  f()
], y.prototype, "_thermostats");
$([
  f()
], y.prototype, "_coolers");
$([
  f()
], y.prototype, "_windowSensors");
$([
  f()
], y.prototype, "_presenceSensors");
$([
  f()
], y.prototype, "_occupancyTimeout");
$([
  f()
], y.prototype, "_occupancySetbackTemp");
$([
  f()
], y.prototype, "_filterByArea");
$([
  f()
], y.prototype, "_zoneAreaId");
$([
  f()
], y.prototype, "_zoneAreaName");
$([
  f()
], y.prototype, "_circuits");
$([
  f()
], y.prototype, "_selectedCircuitId");
$([
  f()
], y.prototype, "_loading");
$([
  f()
], y.prototype, "_error");
$([
  f()
], y.prototype, "_showDeleteDialog");
customElements.get("zone-editor") || customElements.define("zone-editor", y);
var Ha = Object.defineProperty, Vt = (s, t, e, i) => {
  for (var r = void 0, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = o(t, e, r) || r);
  return r && Ha(t, e, r), r;
};
const Pa = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], dr = class dr extends I {
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
        const t = await this.hass.callWS({
          type: "config/entity_registry/get",
          entity_id: this.zoneId
        });
        this._uniqueId = t.unique_id;
        const e = this.hass.states[this.zoneId];
        if (e && e.attributes.schedule) {
          const i = JSON.parse(
            JSON.stringify(e.attributes.schedule)
          );
          this._schedule = i.map((r) => ({
            ...r,
            temp_heat: r.temp_heat ?? 20,
            temp_cool: r.temp_cool ?? 24
          })), this._config = {
            name: e.attributes.friendly_name,
            temperature_sensor: e.attributes.temperature_sensor,
            heaters: e.attributes.heaters || [],
            coolers: e.attributes.coolers || [],
            window_sensors: e.attributes.window_sensors || []
          };
        }
      } catch (t) {
        console.error(t), alert("Failed to load schedule");
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
  _removeBlock(t) {
    this._schedule = this._schedule.filter((e, i) => i !== t);
  }
  _updateBlock(t, e, i) {
    const r = [...this._schedule];
    r[t] = { ...r[t], [e]: i }, this._schedule = r;
  }
  _toggleDay(t, e) {
    const i = this._schedule[t], r = new Set(i.days);
    r.has(e) ? r.delete(e) : r.add(e), this._updateBlock(t, "days", Array.from(r));
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
    } catch (t) {
      alert("Save failed: " + t.message);
    }
  }
  render() {
    return this._loading ? u`<div>Loading...</div>` : u`
      <div class="card">
        <h2>Schedule: ${this._config.name}</h2>
        <div class="block-list">
          ${this._schedule.map(
      (t, e) => u`
              <div class="block-item">
                <div class="block-header">
                  <span>Block ${e + 1}</span>
                  <button
                    class="delete-btn"
                    @click=${() => this._removeBlock(e)}
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>

                <div class="row">
                  <div class="field">
                    <label>Name</label>
                    <input
                      type="text"
                      .value=${t.name}
                      @input=${(i) => this._updateBlock(e, "name", i.target.value)}
                    />
                  </div>
                  <div class="field">
                    <label>Start Time</label>
                    <input
                      type="time"
                      .value=${t.start_time}
                      @input=${(i) => this._updateBlock(e, "start_time", i.target.value)}
                    />
                  </div>
                  ${this._config.heaters.length > 0 ? u`
                        <div class="field">
                          <label>Heat To (°C)</label>
                          <input
                            type="number"
                            step="0.5"
                            .value=${t.temp_heat ?? 20}
                            @input=${(i) => this._updateBlock(
        e,
        "temp_heat",
        parseFloat(i.target.value)
      )}
                          />
                        </div>
                      ` : ""}
                  ${this._config.coolers.length > 0 ? u`
                        <div class="field">
                          <label>Cool To (°C)</label>
                          <input
                            type="number"
                            step="0.5"
                            .value=${t.temp_cool ?? 24}
                            @input=${(i) => this._updateBlock(
        e,
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
                      ${Pa.map(
        (i) => u`
                          <button
                            class="day-btn ${t.days.includes(i) ? "active" : ""}"
                            @click=${() => this._toggleDay(e, i)}
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
dr.styles = st`
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
let q = dr;
Vt([
  S({ attribute: !1 })
], q.prototype, "hass");
Vt([
  S({ attribute: !1 })
], q.prototype, "zoneId");
Vt([
  f()
], q.prototype, "_schedule");
Vt([
  f()
], q.prototype, "_loading");
Vt([
  f()
], q.prototype, "_uniqueId");
Vt([
  f()
], q.prototype, "_config");
customElements.get("schedule-editor") || customElements.define("schedule-editor", q);
var Ua = Object.defineProperty, be = (s, t, e, i) => {
  for (var r = void 0, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = o(t, e, r) || r);
  return r && Ua(t, e, r), r;
};
const pr = class pr extends I {
  constructor() {
    super(...arguments), this._historyGroups = [], this._isLoading = !1, this._error = null, this._duration = 3;
  }
  firstUpdated() {
    this._fetchHistory();
  }
  _setDuration(t) {
    this._duration !== t && (this._duration = t, this._fetchHistory());
  }
  async _fetchHistory() {
    this._isLoading = !0, this._error = null;
    try {
      const t = le.getGroupedZones(this.hass);
      if (t.length === 0) {
        this._isLoading = !1, this._historyGroups = [];
        return;
      }
      const e = [];
      t.forEach((p) => {
        p.zones.forEach((d) => e.push(d.entity_id));
      });
      const i = /* @__PURE__ */ new Date(), r = i.getTime(), n = new Date(r - this._duration * 60 * 60 * 1e3), o = n.getTime(), l = r - o, a = await this.hass.callApi(
        "GET",
        `history/period/${n.toISOString()}?filter_entity_id=${e.join(",")}&end_time=${i.toISOString()}`
      ), c = {};
      a.forEach((p) => {
        var Z, at, j;
        if (!p || p.length === 0) return;
        const d = p[0].entity_id, h = ((at = (Z = this.hass.states[d]) == null ? void 0 : Z.attributes) == null ? void 0 : at.friendly_name) || d, m = [], _ = [];
        let v = 100, b = -100;
        const O = [];
        for (let z = 0; z < p.length; z++) {
          const x = p[z], N = p[z + 1], G = new Date(x.last_changed).getTime(), lt = Math.max(G, o);
          let V = N ? new Date(N.last_changed).getTime() : r;
          if (V = Math.min(V, r), V > lt) {
            let T = "color-unknown", K = String(x.state);
            const Ht = x.attributes || {}, ur = Ht.hvac_action;
            if (Ht.safety_mode)
              T = "color-safety", K = "Safety Mode";
            else if (Ht.active_intent_source === "away_mode")
              T = "color-away", K = "Global Away Mode";
            else if (Ht.open_window_sensor)
              T = "color-window", K = `Window Open (${Ht.open_window_sensor})`;
            else if (Ht.active_intent_source === "occupancy_setback")
              T = "color-occupancy", K = "Occupancy Setback";
            else if (ur === "heating")
              T = "color-heat", K = `Heating (${x.state})`;
            else if (ur === "cooling")
              T = "color-cool", K = `Cooling (${x.state})`;
            else {
              const dt = String(x.state).toLowerCase();
              dt === "heat" ? T = "color-heat" : dt === "cool" ? T = "color-cool" : dt === "off" ? T = "color-off" : dt === "auto" ? T = "color-auto" : dt === "idle" ? T = "color-idle" : dt === "unavailable" && (T = "color-unknown");
            }
            const ct = m[m.length - 1];
            if (ct && ct.color === T && ct.tooltip === K)
              ct.end = V, ct.width = (ct.end - ct.start) / l * 100;
            else {
              const uo = (V - lt) / l * 100;
              m.push({
                state: x.state,
                tooltip: K,
                start: lt,
                end: V,
                width: uo,
                color: T
              });
            }
          }
          const kt = parseFloat((j = x.attributes) == null ? void 0 : j.current_temperature);
          isNaN(kt) || (O.push({ t: G, v: kt }), kt < v && (v = kt), kt > b && (b = kt));
        }
        v > b ? (v = 18, b = 24) : (v = Math.floor(v - 1), b = Math.ceil(b + 1));
        const D = b - v || 1;
        O.sort((z, x) => z.t - x.t);
        for (const z of O) {
          const x = Math.max(z.t, o);
          if (x > r) break;
          const N = (x - o) / l * 100, G = 100 - (z.v - v) / D * 100;
          _.push({ x: N, y: G, val: z.v });
        }
        c[d] = {
          entity_id: d,
          name: h,
          segments: m,
          tempPoints: _,
          minTemp: v,
          maxTemp: b
        };
      }), this._historyGroups = t.map((p) => ({
        floorName: p.floorName,
        floorIcon: p.floorIcon,
        zones: p.zones.map((d) => c[d.entity_id]).filter((d) => d !== void 0)
      })).filter((p) => p.zones.length > 0);
    } catch (t) {
      console.error("History fetch error:", t), this._error = "Failed to load history data.";
    } finally {
      this._isLoading = !1;
    }
  }
  _formatDuration(t) {
    const e = Math.floor(t / 6e4), i = Math.floor(e / 60), r = e % 60;
    return i > 0 ? `${i}h ${r}m` : `${r}m`;
  }
  _renderTemperatureOverlay(t) {
    if (t.tempPoints.length < 2) return "";
    const e = t.tempPoints.map(
      (i, r) => `${r === 0 ? "M" : "L"} ${i.x.toFixed(2)} ${i.y.toFixed(2)}`
    ).join(" ");
    return u`
      <svg
        class="temp-overlay"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="${e}" />
      </svg>
      <div class="temp-labels">
        <span style="line-height: 1">${t.maxTemp}°</span>
        <span style="line-height: 1">${t.minTemp}°</span>
      </div>
    `;
  }
  render() {
    return u`
      <div class="card">
        <div class="header-row">
          <div class="header">Zone History</div>
          <div class="header-actions">
            <div class="duration-selector">
              <button
                class="duration-btn ${this._duration === 3 ? "active" : ""}"
                @click=${() => this._setDuration(3)}
              >
                3h
              </button>
              <button
                class="duration-btn ${this._duration === 24 ? "active" : ""}"
                @click=${() => this._setDuration(24)}
              >
                24h
              </button>
              <button
                class="duration-btn ${this._duration === 72 ? "active" : ""}"
                @click=${() => this._setDuration(72)}
              >
                3d
              </button>
              <button
                class="duration-btn ${this._duration === 168 ? "active" : ""}"
                @click=${() => this._setDuration(168)}
              >
                7d
              </button>
            </div>
            <button
              class="refresh-btn"
              @click=${() => this._fetchHistory()}
              title="Refresh"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <div class="content">
          ${this._isLoading ? u`<div class="loading">Loading history...</div>` : ""}
          ${this._error ? u`<div class="error">${this._error}</div>` : ""}
          ${!this._isLoading && !this._error ? this._historyGroups.map(
      (t) => u`
                  ${t.floorName ? u`
                        <div class="floor-header">
                          <ha-icon
                            .icon=${t.floorIcon || "mdi:home-floor-1"}
                          ></ha-icon>
                          ${t.floorName}
                        </div>
                      ` : ""}
                  ${t.zones.map(
        (e) => u`
                      <div class="zone-row">
                        <div class="zone-name">
                          <span>${e.name}</span>
                        </div>
                        <div style="position: relative; margin-right: 30px;">
                          <!-- wrapper for labels -->
                          <div class="timeline-track">
                            ${e.segments.map(
          (i) => u`
                                <div
                                  class="segment ${i.color}"
                                  style="width: ${i.width}%"
                                  title="${i.tooltip} (${this._formatDuration(
            i.end - i.start
          )})
${new Date(i.start).toLocaleTimeString()} - ${new Date(
            i.end
          ).toLocaleTimeString()}"
                                ></div>
                              `
        )}
                            ${this._renderTemperatureOverlay(e)}
                          </div>
                        </div>
                      </div>
                    `
      )}
                `
    ) : ""}
        </div>

        <div class="legend">
          <div class="legend-item">
            <div class="dot color-heat"></div>
            Heat
          </div>
          <div class="legend-item">
            <div class="dot color-cool"></div>
            Cool
          </div>
          <div class="legend-item">
            <div class="dot color-auto"></div>
            Auto
          </div>
          <div class="legend-item">
            <div class="dot color-off"></div>
            Off
          </div>
          <div class="legend-item">
            <div class="dot color-safety"></div>
            Safety
          </div>
          <div class="legend-item">
            <div class="dot color-away"></div>
            Away
          </div>
          <div class="legend-item">
            <div class="dot color-window"></div>
            Window
          </div>
          <div class="legend-item">
            <div class="dot color-occupancy"></div>
            Setback
          </div>
          <div class="legend-item">
            <div
              style="width: 20px; height: 2px; background: #000; opacity: 1;"
            ></div>
            Temp
          </div>
        </div>
      </div>
    `;
  }
};
pr.styles = st`
    :host {
      display: block;
      padding: 16px;
      height: 100%;
      box-sizing: border-box;
    }
    .card {
      background: var(--card-background-color, white);
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-shrink: 0;
      gap: 16px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .header {
      font-size: 20px;
      font-weight: 500;
      flex: 1;
    }
    .refresh-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .refresh-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .duration-selector {
      display: flex;
      background: #f5f5f5;
      border-radius: 18px;
      padding: 4px;
      gap: 4px;
    }
    .duration-btn {
      border: none;
      background: none;
      padding: 4px 12px;
      border-radius: 14px;
      font-size: 0.85rem;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: all 0.2s;
      font-weight: 500;
    }
    .duration-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .duration-btn.active {
      background: var(--primary-color, #03a9f4);
      color: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding-right: 8px;
    }
    .floor-header {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid var(--divider-color, #eee);
      padding-bottom: 4px;
    }
    .floor-header:first-child {
      margin-top: 0;
    }
    .zone-row {
      margin-bottom: 24px;
      padding-left: 8px;
    }
    .zone-name {
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 0.9rem;
      display: flex;
      justify-content: space-between;
    }
    .timeline-track {
      height: 36px;
      background: #f5f5f5;
      border-radius: 6px;
      position: relative;
      display: flex;
      width: 100%;
    }
    .segment {
      height: 100%;
      transition: opacity 0.2s;
    }
    .segment:hover {
      opacity: 0.8;
    }
    .temp-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }
    .temp-overlay path {
      stroke: #000;
      stroke-width: 2px;
      fill: none;
      stroke-opacity: 1;
      vector-effect: non-scaling-stroke;
    }
    .temp-labels {
      position: absolute;
      right: -30px;
      top: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 0.7rem;
      color: var(--secondary-text-color);
      pointer-events: none;
    }
    .legend {
      display: flex;
      gap: 16px;
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid var(--divider-color, #eee);
      justify-content: center;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .loading,
    .error {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--secondary-text-color);
    }
    .error {
      color: var(--error-color, red);
    }
    /* State Colors */
    .color-heat {
      background-color: rgba(255, 87, 34, 0.6);
    }
    .color-cool {
      background-color: rgba(33, 150, 243, 0.6);
    }
    .color-off {
      background-color: rgba(158, 158, 158, 0.6);
    }
    .color-auto {
      background-color: rgba(76, 175, 80, 0.6);
    }
    .color-idle {
      background-color: rgba(224, 224, 224, 0.6);
    }
    .color-unknown {
      background-color: rgba(189, 189, 189, 0.6);
    }
    /* Override Colors */
    .color-safety {
      background-color: rgba(244, 67, 54, 0.8);
    } /* Red */
    .color-window {
      background-color: rgba(255, 152, 0, 0.8);
    } /* Orange */
    .color-occupancy {
      background-color: rgba(139, 195, 74, 0.6);
    } /* Light Green */
    .color-away {
      background-color: rgba(156, 39, 176, 0.6);
    } /* Purple */
  `;
let rt = pr;
be([
  S({ attribute: !1 })
], rt.prototype, "hass");
be([
  f()
], rt.prototype, "_historyGroups");
be([
  f()
], rt.prototype, "_isLoading");
be([
  f()
], rt.prototype, "_error");
be([
  f()
], rt.prototype, "_duration");
customElements.get("history-view") || customElements.define("history-view", rt);
var Ra = Object.defineProperty, nt = (s, t, e, i) => {
  for (var r = void 0, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = o(t, e, r) || r);
  return r && Ra(t, e, r), r;
};
const hr = class hr extends I {
  constructor() {
    super(...arguments), this._view = "zones", this._editingZoneId = null, this._unmanagedCount = 0, this._isAwayMode = !1, this._circuits = [], this._handleVisibilityChange = () => {
      var t;
      if (document.visibilityState === "visible") {
        const e = window.location.pathname.includes("climate-dashboard");
        if (!this.isConnected && e) {
          console.warn(
            "[ClimateDashboard] Zombie state detected (Tab visible but component detached). Forcing reload."
          ), window.location.reload();
          return;
        }
        if (this.isConnected) {
          this.requestUpdate();
          const i = (t = this.shadowRoot) == null ? void 0 : t.querySelector(
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
  updated(t) {
    super.updated(t), t.has("hass") && this.hass && !this._unsubSettings && this._subscribeSettings();
  }
  async _subscribeSettings() {
    if (this.hass)
      try {
        this._unsubSettings = await this.hass.connection.subscribeEvents(
          (t) => {
            t.data.is_away_mode_on !== void 0 && (this._isAwayMode = t.data.is_away_mode_on);
          },
          "climate_dashboard_settings_updated"
        );
      } catch (t) {
        console.error("Failed to subscribe to settings updates", t);
      }
  }
  firstUpdated() {
    this._scanForBadge(), this._fetchGlobalSettings(), this._fetchCircuits();
  }
  async _fetchGlobalSettings() {
    if (this.hass)
      try {
        const t = await this.hass.callWS({
          type: "climate_dashboard/settings/get"
        });
        this._isAwayMode = t.is_away_mode_on;
      } catch (t) {
        console.error("Failed to fetch settings", t);
      }
  }
  async _fetchCircuits() {
    if (this.hass)
      try {
        this._circuits = await this.hass.callWS({
          type: "climate_dashboard/circuit/list"
        });
      } catch (t) {
        console.error("Failed to fetch circuits", t);
      }
  }
  async _scanForBadge() {
    if (this.hass)
      try {
        const e = (await this.hass.callWS({
          type: "climate_dashboard/scan"
        })).filter(
          (i) => ["climate", "switch"].includes(i.domain)
        );
        this._unmanagedCount = e.length;
      } catch (t) {
        console.error("Badge scan failed", t);
      }
  }
  _getEditorCandidates() {
    if (!this.hass) return [];
    const t = ["climate", "switch", "sensor", "binary_sensor"];
    return Object.values(this.hass.states).filter(
      (e) => t.includes(e.entity_id.split(".")[0]) && !e.attributes.is_climate_dashboard_zone && !e.entity_id.startsWith("climate.zone_")
    ).map((e) => {
      var i, r, n, o, l, a;
      return {
        entity_id: e.entity_id,
        domain: e.entity_id.split(".")[0],
        name: e.attributes.friendly_name || e.entity_id,
        device_class: e.attributes.device_class,
        area_id: ((r = (i = this.hass.entities) == null ? void 0 : i[e.entity_id]) == null ? void 0 : r.area_id) || ((a = (l = this.hass.devices) == null ? void 0 : l[(o = (n = this.hass.entities) == null ? void 0 : n[e.entity_id]) == null ? void 0 : o.device_id]) == null ? void 0 : a.area_id)
      };
    });
  }
  render() {
    try {
      return this.hass ? u`
        <div class="header">
          ${this._view !== "zones" ? u`
                <button
                  class="icon-btn"
                  @click=${() => {
        this._view === "schedule" ? (this._view = "timeline", this._editingZoneId = null) : (this._view = "zones", this._editingZoneId = null);
      }}
                >
                  <ha-icon icon="mdi:arrow-left"></ha-icon>
                </button>
              ` : u`
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

            <!-- History Toggle -->
            <button
              class="icon-btn ${this._view === "history" ? "active" : ""}"
              @click=${() => this._view = "history"}
            >
              <ha-icon icon="mdi:chart-line"></ha-icon>
            </button>

            <!-- Setup Toggle (Badge) -->
            <button
              class="icon-btn ${this._view === "setup" ? "active" : ""}"
              @click=${() => this._view = "setup"}
            >
              <ha-icon icon="mdi:cog"></ha-icon>
              ${this._unmanagedCount > 0 ? u`<span class="badge">${this._unmanagedCount}</span>` : ""}
            </button>
          </div>
        </div>

        <div class="content">
          <!-- Global Mode Toggles (Only show in main views) -->
          ${this._view === "zones" || this._view === "timeline" ? u`
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
                  ${this._circuits.length > 0 ? u`
                        <div class="circuit-container">
                          ${this._circuits.map(
        (t) => u`
                              <div
                                class="circuit-indicator ${t.is_active ? "active" : ""}"
                                title="${t.name}: ${t.member_zone_names.join(
          ", "
        ) || "No zones"}"
                              ></div>
                            `
      )}
                        </div>
                      ` : ""}
                </div>
              ` : ""}
          ${this._view === "zones" ? u`<zones-view
                .hass=${this.hass}
                .isAwayMode=${this._isAwayMode}
                @zone-settings=${(t) => {
        this._editingZoneId = t.detail.entityId, this._view = "editor";
      }}
                @zone-details=${(t) => {
        this._editingZoneId = t.detail.entityId, this._view = "timeline";
      }}
              ></zones-view>` : ""}
          ${this._view === "setup" ? u`<setup-view .hass=${this.hass}></setup-view>` : ""}
          ${this._view === "timeline" ? u` <timeline-view
                .hass=${this.hass}
                .focusZoneId=${this._editingZoneId}
                @schedule-selected=${(t) => {
        this._editingZoneId = t.detail.entityId, this._view = "schedule";
      }}
              ></timeline-view>` : ""}
          ${this._view === "history" ? u`<history-view .hass=${this.hass}></history-view>` : ""}
          ${this._view === "editor" && this._editingZoneId ? u`
                <zone-editor
                  .hass=${this.hass}
                  .zoneId=${this._editingZoneId}
                  .allEntities=${this._getEditorCandidates()}
                  @close=${() => {
        this._view = "zones", this._editingZoneId = null;
      }}
                ></zone-editor>
              ` : ""}
          ${this._view === "schedule" && this._editingZoneId ? u`
                <schedule-editor
                  .hass=${this.hass}
                  .zoneId=${this._editingZoneId}
                  @close=${() => {
        this._view = "timeline", this._editingZoneId = null;
      }}
                ></schedule-editor>
              ` : ""}
        </div>
      ` : u`<div class="loading">Loading Home Assistant...</div>`;
    } catch (t) {
      return console.error("Critical Error rendering Climate Dashboard:", t), u`
        <div
          style="padding: 24px; text-align: center; color: var(--error-color);"
        >
          <h2>Dashboard Error</h2>
          <p>Something went wrong rendering the dashboard.</p>
          <pre style="text-align: left; background: #eee; padding: 16px;">
${t instanceof Error ? t.message : String(t)}</pre
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
  async _setAwayMode(t) {
    if (this._isAwayMode === t) return;
    const e = this._isAwayMode;
    this._isAwayMode = t;
    try {
      await this.hass.callWS({
        type: "climate_dashboard/settings/update",
        is_away_mode_on: t
      });
    } catch (i) {
      this._isAwayMode = e, console.error("Failed to set Away Mode", i);
    }
  }
};
hr.styles = st`
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
      align-items: center;
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
    .circuit-container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-left: 12px;
      padding-right: 12px;
      border-left: 1px solid var(--divider-color, #eee);
      height: 32px;
    }
    .circuit-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: var(--disabled-text-color, #bdbdbd);
      cursor: help;
      transition: all 0.3s ease;
    }
    .circuit-indicator.active {
      background-color: var(--success-color, #4caf50);
      box-shadow: 0 0 6px var(--success-color, #4caf50);
      transform: scale(1.1);
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
let F = hr;
nt([
  S({ attribute: !1 })
], F.prototype, "hass");
nt([
  S({ attribute: !1 })
], F.prototype, "narrow");
nt([
  S({ attribute: !1 })
], F.prototype, "panel");
nt([
  f()
], F.prototype, "_view");
nt([
  f()
], F.prototype, "_editingZoneId");
nt([
  f()
], F.prototype, "_unmanagedCount");
nt([
  f()
], F.prototype, "_isAwayMode");
nt([
  f()
], F.prototype, "_circuits");
customElements.get("climate-dashboard") || customElements.define("climate-dashboard", F);
console.info(
  "%c CLIMATE-DASHBOARD %c 0.0.1 ",
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;"
);
