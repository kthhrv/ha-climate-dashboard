/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ee = globalThis,
  _e =
    ee.ShadowRoot &&
    (ee.ShadyCSS === void 0 || ee.ShadyCSS.nativeShadow) &&
    "adoptedStyleSheets" in Document.prototype &&
    "replace" in CSSStyleSheet.prototype,
  me = Symbol(),
  ve = /* @__PURE__ */ new WeakMap();
let Oe = class {
  constructor(e, t, o) {
    if (((this._$cssResult$ = !0), o !== me))
      throw Error(
        "CSSResult is not constructable. Use `unsafeCSS` or `css` instead.",
      );
    ((this.cssText = e), (this.t = t));
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (_e && e === void 0) {
      const o = t !== void 0 && t.length === 1;
      (o && (e = ve.get(t)),
        e === void 0 &&
          ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText),
          o && ve.set(t, e)));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ne = (s) => new Oe(typeof s == "string" ? s : s + "", void 0, me),
  I = (s, ...e) => {
    const t =
      s.length === 1
        ? s[0]
        : e.reduce(
            (o, i, r) =>
              o +
              ((n) => {
                if (n._$cssResult$ === !0) return n.cssText;
                if (typeof n == "number") return n;
                throw Error(
                  "Value passed to 'css' function must be a 'css' function result: " +
                    n +
                    ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.",
                );
              })(i) +
              s[r + 1],
            s[0],
          );
    return new Oe(t, s, me);
  },
  Be = (s, e) => {
    if (_e)
      s.adoptedStyleSheets = e.map((t) =>
        t instanceof CSSStyleSheet ? t : t.styleSheet,
      );
    else
      for (const t of e) {
        const o = document.createElement("style"),
          i = ee.litNonce;
        (i !== void 0 && o.setAttribute("nonce", i),
          (o.textContent = t.cssText),
          s.appendChild(o));
      }
  },
  be = _e
    ? (s) => s
    : (s) =>
        s instanceof CSSStyleSheet
          ? ((e) => {
              let t = "";
              for (const o of e.cssRules) t += o.cssText;
              return Ne(t);
            })(s)
          : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const {
    is: je,
    defineProperty: He,
    getOwnPropertyDescriptor: Le,
    getOwnPropertyNames: Re,
    getOwnPropertySymbols: Ze,
    getPrototypeOf: qe,
  } = Object,
  C = globalThis,
  ye = C.trustedTypes,
  We = ye ? ye.emptyScript : "",
  ce = C.reactiveElementPolyfillSupport,
  F = (s, e) => s,
  te = {
    toAttribute(s, e) {
      switch (e) {
        case Boolean:
          s = s ? We : null;
          break;
        case Object:
        case Array:
          s = s == null ? s : JSON.stringify(s);
      }
      return s;
    },
    fromAttribute(s, e) {
      let t = s;
      switch (e) {
        case Boolean:
          t = s !== null;
          break;
        case Number:
          t = s === null ? null : Number(s);
          break;
        case Object:
        case Array:
          try {
            t = JSON.parse(s);
          } catch {
            t = null;
          }
      }
      return t;
    },
  },
  ge = (s, e) => !je(s, e),
  $e = {
    attribute: !0,
    type: String,
    converter: te,
    reflect: !1,
    useDefault: !1,
    hasChanged: ge,
  };
(Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")),
  C.litPropertyMetadata ??
    (C.litPropertyMetadata = /* @__PURE__ */ new WeakMap()));
let B = class extends HTMLElement {
  static addInitializer(e) {
    (this._$Ei(), (this.l ?? (this.l = [])).push(e));
  }
  static get observedAttributes() {
    return (this.finalize(), this._$Eh && [...this._$Eh.keys()]);
  }
  static createProperty(e, t = $e) {
    if (
      (t.state && (t.attribute = !1),
      this._$Ei(),
      this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0),
      this.elementProperties.set(e, t),
      !t.noAccessor)
    ) {
      const o = Symbol(),
        i = this.getPropertyDescriptor(e, o, t);
      i !== void 0 && He(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, t, o) {
    const { get: i, set: r } = Le(this.prototype, e) ?? {
      get() {
        return this[t];
      },
      set(n) {
        this[t] = n;
      },
    };
    return {
      get: i,
      set(n) {
        const d = i == null ? void 0 : i.call(this);
        (r == null || r.call(this, n), this.requestUpdate(e, d, o));
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? $e;
  }
  static _$Ei() {
    if (this.hasOwnProperty(F("elementProperties"))) return;
    const e = qe(this);
    (e.finalize(),
      e.l !== void 0 && (this.l = [...e.l]),
      (this.elementProperties = new Map(e.elementProperties)));
  }
  static finalize() {
    if (this.hasOwnProperty(F("finalized"))) return;
    if (
      ((this.finalized = !0), this._$Ei(), this.hasOwnProperty(F("properties")))
    ) {
      const t = this.properties,
        o = [...Re(t), ...Ze(t)];
      for (const i of o) this.createProperty(i, t[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0)
        for (const [o, i] of t) this.elementProperties.set(o, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, o] of this.elementProperties) {
      const i = this._$Eu(t, o);
      i !== void 0 && this._$Eh.set(i, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const o = new Set(e.flat(1 / 0).reverse());
      for (const i of o) t.unshift(be(i));
    } else e !== void 0 && t.push(be(e));
    return t;
  }
  static _$Eu(e, t) {
    const o = t.attribute;
    return o === !1
      ? void 0
      : typeof o == "string"
        ? o
        : typeof e == "string"
          ? e.toLowerCase()
          : void 0;
  }
  constructor() {
    (super(),
      (this._$Ep = void 0),
      (this.isUpdatePending = !1),
      (this.hasUpdated = !1),
      (this._$Em = null),
      this._$Ev());
  }
  _$Ev() {
    var e;
    ((this._$ES = new Promise((t) => (this.enableUpdating = t))),
      (this._$AL = /* @__PURE__ */ new Map()),
      this._$E_(),
      this.requestUpdate(),
      (e = this.constructor.l) == null || e.forEach((t) => t(this)));
  }
  addController(e) {
    var t;
    ((this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e),
      this.renderRoot !== void 0 &&
        this.isConnected &&
        ((t = e.hostConnected) == null || t.call(e)));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(),
      t = this.constructor.elementProperties;
    for (const o of t.keys())
      this.hasOwnProperty(o) && (e.set(o, this[o]), delete this[o]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e =
      this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return (Be(e, this.constructor.elementStyles), e);
  }
  connectedCallback() {
    var e;
    (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()),
      this.enableUpdating(!0),
      (e = this._$EO) == null ||
        e.forEach((t) => {
          var o;
          return (o = t.hostConnected) == null ? void 0 : o.call(t);
        }));
  }
  enableUpdating(e) {}
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null ||
      e.forEach((t) => {
        var o;
        return (o = t.hostDisconnected) == null ? void 0 : o.call(t);
      });
  }
  attributeChangedCallback(e, t, o) {
    this._$AK(e, o);
  }
  _$ET(e, t) {
    var r;
    const o = this.constructor.elementProperties.get(e),
      i = this.constructor._$Eu(e, o);
    if (i !== void 0 && o.reflect === !0) {
      const n = (
        ((r = o.converter) == null ? void 0 : r.toAttribute) !== void 0
          ? o.converter
          : te
      ).toAttribute(t, o.type);
      ((this._$Em = e),
        n == null ? this.removeAttribute(i) : this.setAttribute(i, n),
        (this._$Em = null));
    }
  }
  _$AK(e, t) {
    var r, n;
    const o = this.constructor,
      i = o._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const d = o.getPropertyOptions(i),
        a =
          typeof d.converter == "function"
            ? { fromAttribute: d.converter }
            : ((r = d.converter) == null ? void 0 : r.fromAttribute) !== void 0
              ? d.converter
              : te;
      this._$Em = i;
      const h = a.fromAttribute(t, d.type);
      ((this[i] = h ?? ((n = this._$Ej) == null ? void 0 : n.get(i)) ?? h),
        (this._$Em = null));
    }
  }
  requestUpdate(e, t, o) {
    var i;
    if (e !== void 0) {
      const r = this.constructor,
        n = this[e];
      if (
        (o ?? (o = r.getPropertyOptions(e)),
        !(
          (o.hasChanged ?? ge)(n, t) ||
          (o.useDefault &&
            o.reflect &&
            n === ((i = this._$Ej) == null ? void 0 : i.get(e)) &&
            !this.hasAttribute(r._$Eu(e, o)))
        ))
      )
        return;
      this.C(e, t, o);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: o, reflect: i, wrapped: r }, n) {
    (o &&
      !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) &&
      (this._$Ej.set(e, n ?? t ?? this[e]), r !== !0 || n !== void 0)) ||
      (this._$AL.has(e) ||
        (this.hasUpdated || o || (t = void 0), this._$AL.set(e, t)),
      i === !0 &&
        this._$Em !== e &&
        (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return (e != null && (await e), !this.isUpdatePending);
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var o;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (
        (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()),
        this._$Ep)
      ) {
        for (const [r, n] of this._$Ep) this[r] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0)
        for (const [r, n] of i) {
          const { wrapped: d } = n,
            a = this[r];
          d !== !0 ||
            this._$AL.has(r) ||
            a === void 0 ||
            this.C(r, void 0, n, a);
        }
    }
    let e = !1;
    const t = this._$AL;
    try {
      ((e = this.shouldUpdate(t)),
        e
          ? (this.willUpdate(t),
            (o = this._$EO) == null ||
              o.forEach((i) => {
                var r;
                return (r = i.hostUpdate) == null ? void 0 : r.call(i);
              }),
            this.update(t))
          : this._$EM());
    } catch (i) {
      throw ((e = !1), this._$EM(), i);
    }
    e && this._$AE(t);
  }
  willUpdate(e) {}
  _$AE(e) {
    var t;
    ((t = this._$EO) == null ||
      t.forEach((o) => {
        var i;
        return (i = o.hostUpdated) == null ? void 0 : i.call(o);
      }),
      this.hasUpdated || ((this.hasUpdated = !0), this.firstUpdated(e)),
      this.updated(e));
  }
  _$EM() {
    ((this._$AL = /* @__PURE__ */ new Map()), (this.isUpdatePending = !1));
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
    (this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))),
      this._$EM());
  }
  updated(e) {}
  firstUpdated(e) {}
};
((B.elementStyles = []),
  (B.shadowRootOptions = { mode: "open" }),
  (B[F("elementProperties")] = /* @__PURE__ */ new Map()),
  (B[F("finalized")] = /* @__PURE__ */ new Map()),
  ce == null || ce({ ReactiveElement: B }),
  (C.reactiveElementVersions ?? (C.reactiveElementVersions = [])).push(
    "2.1.1",
  ));
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis,
  ie = J.trustedTypes,
  xe = ie ? ie.createPolicy("lit-html", { createHTML: (s) => s }) : void 0,
  Pe = "$lit$",
  k = `lit$${Math.random().toFixed(9).slice(2)}$`,
  De = "?" + k,
  Ve = `<${De}>`,
  T = document,
  K = () => T.createComment(""),
  G = (s) => s === null || (typeof s != "object" && typeof s != "function"),
  fe = Array.isArray,
  Fe = (s) =>
    fe(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function",
  he = `[ 	
\f\r]`,
  V = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
  we = /-->/g,
  Se = />/g,
  O = RegExp(
    `>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,
    "g",
  ),
  Ae = /'/g,
  ke = /"/g,
  Te = /^(?:script|style|textarea|title)$/i,
  Je =
    (s) =>
    (e, ...t) => ({ _$litType$: s, strings: e, values: t }),
  l = Je(1),
  j = Symbol.for("lit-noChange"),
  _ = Symbol.for("lit-nothing"),
  Ce = /* @__PURE__ */ new WeakMap(),
  P = T.createTreeWalker(T, 129);
function Ie(s, e) {
  if (!fe(s) || !s.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return xe !== void 0 ? xe.createHTML(e) : e;
}
const Ke = (s, e) => {
  const t = s.length - 1,
    o = [];
  let i,
    r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "",
    n = V;
  for (let d = 0; d < t; d++) {
    const a = s[d];
    let h,
      u,
      c = -1,
      f = 0;
    for (; f < a.length && ((n.lastIndex = f), (u = n.exec(a)), u !== null); )
      ((f = n.lastIndex),
        n === V
          ? u[1] === "!--"
            ? (n = we)
            : u[1] !== void 0
              ? (n = Se)
              : u[2] !== void 0
                ? (Te.test(u[2]) && (i = RegExp("</" + u[2], "g")), (n = O))
                : u[3] !== void 0 && (n = O)
          : n === O
            ? u[0] === ">"
              ? ((n = i ?? V), (c = -1))
              : u[1] === void 0
                ? (c = -2)
                : ((c = n.lastIndex - u[2].length),
                  (h = u[1]),
                  (n = u[3] === void 0 ? O : u[3] === '"' ? ke : Ae))
            : n === ke || n === Ae
              ? (n = O)
              : n === we || n === Se
                ? (n = V)
                : ((n = O), (i = void 0)));
    const v = n === O && s[d + 1].startsWith("/>") ? " " : "";
    r +=
      n === V
        ? a + Ve
        : c >= 0
          ? (o.push(h), a.slice(0, c) + Pe + a.slice(c) + k + v)
          : a + k + (c === -2 ? d : v);
  }
  return [
    Ie(
      s,
      r + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : ""),
    ),
    o,
  ];
};
class X {
  constructor({ strings: e, _$litType$: t }, o) {
    let i;
    this.parts = [];
    let r = 0,
      n = 0;
    const d = e.length - 1,
      a = this.parts,
      [h, u] = Ke(e, t);
    if (
      ((this.el = X.createElement(h, o)),
      (P.currentNode = this.el.content),
      t === 2 || t === 3)
    ) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (i = P.nextNode()) !== null && a.length < d; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes())
          for (const c of i.getAttributeNames())
            if (c.endsWith(Pe)) {
              const f = u[n++],
                v = i.getAttribute(c).split(k),
                $ = /([.?@])?(.*)/.exec(f);
              (a.push({
                type: 1,
                index: r,
                name: $[2],
                strings: v,
                ctor:
                  $[1] === "."
                    ? Xe
                    : $[1] === "?"
                      ? Ye
                      : $[1] === "@"
                        ? Qe
                        : oe,
              }),
                i.removeAttribute(c));
            } else
              c.startsWith(k) &&
                (a.push({ type: 6, index: r }), i.removeAttribute(c));
        if (Te.test(i.tagName)) {
          const c = i.textContent.split(k),
            f = c.length - 1;
          if (f > 0) {
            i.textContent = ie ? ie.emptyScript : "";
            for (let v = 0; v < f; v++)
              (i.append(c[v], K()),
                P.nextNode(),
                a.push({ type: 2, index: ++r }));
            i.append(c[f], K());
          }
        }
      } else if (i.nodeType === 8)
        if (i.data === De) a.push({ type: 2, index: r });
        else {
          let c = -1;
          for (; (c = i.data.indexOf(k, c + 1)) !== -1; )
            (a.push({ type: 7, index: r }), (c += k.length - 1));
        }
      r++;
    }
  }
  static createElement(e, t) {
    const o = T.createElement("template");
    return ((o.innerHTML = e), o);
  }
}
function H(s, e, t = s, o) {
  var n, d;
  if (e === j) return e;
  let i = o !== void 0 ? ((n = t._$Co) == null ? void 0 : n[o]) : t._$Cl;
  const r = G(e) ? void 0 : e._$litDirective$;
  return (
    (i == null ? void 0 : i.constructor) !== r &&
      ((d = i == null ? void 0 : i._$AO) == null || d.call(i, !1),
      r === void 0 ? (i = void 0) : ((i = new r(s)), i._$AT(s, t, o)),
      o !== void 0 ? ((t._$Co ?? (t._$Co = []))[o] = i) : (t._$Cl = i)),
    i !== void 0 && (e = H(s, i._$AS(s, e.values), i, o)),
    e
  );
}
class Ge {
  constructor(e, t) {
    ((this._$AV = []), (this._$AN = void 0), (this._$AD = e), (this._$AM = t));
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const {
        el: { content: t },
        parts: o,
      } = this._$AD,
      i = ((e == null ? void 0 : e.creationScope) ?? T).importNode(t, !0);
    P.currentNode = i;
    let r = P.nextNode(),
      n = 0,
      d = 0,
      a = o[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let h;
        (a.type === 2
          ? (h = new Y(r, r.nextSibling, this, e))
          : a.type === 1
            ? (h = new a.ctor(r, a.name, a.strings, this, e))
            : a.type === 6 && (h = new et(r, this, e)),
          this._$AV.push(h),
          (a = o[++d]));
      }
      n !== (a == null ? void 0 : a.index) && ((r = P.nextNode()), n++);
    }
    return ((P.currentNode = T), i);
  }
  p(e) {
    let t = 0;
    for (const o of this._$AV)
      (o !== void 0 &&
        (o.strings !== void 0
          ? (o._$AI(e, o, t), (t += o.strings.length - 2))
          : o._$AI(e[t])),
        t++);
  }
}
class Y {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, o, i) {
    ((this.type = 2),
      (this._$AH = _),
      (this._$AN = void 0),
      (this._$AA = e),
      (this._$AB = t),
      (this._$AM = o),
      (this.options = i),
      (this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0));
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return (
      t !== void 0 &&
        (e == null ? void 0 : e.nodeType) === 11 &&
        (e = t.parentNode),
      e
    );
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    ((e = H(this, e, t)),
      G(e)
        ? e === _ || e == null || e === ""
          ? (this._$AH !== _ && this._$AR(), (this._$AH = _))
          : e !== this._$AH && e !== j && this._(e)
        : e._$litType$ !== void 0
          ? this.$(e)
          : e.nodeType !== void 0
            ? this.T(e)
            : Fe(e)
              ? this.k(e)
              : this._(e));
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), (this._$AH = this.O(e)));
  }
  _(e) {
    (this._$AH !== _ && G(this._$AH)
      ? (this._$AA.nextSibling.data = e)
      : this.T(T.createTextNode(e)),
      (this._$AH = e));
  }
  $(e) {
    var r;
    const { values: t, _$litType$: o } = e,
      i =
        typeof o == "number"
          ? this._$AC(e)
          : (o.el === void 0 &&
              (o.el = X.createElement(Ie(o.h, o.h[0]), this.options)),
            o);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === i) this._$AH.p(t);
    else {
      const n = new Ge(i, this),
        d = n.u(this.options);
      (n.p(t), this.T(d), (this._$AH = n));
    }
  }
  _$AC(e) {
    let t = Ce.get(e.strings);
    return (t === void 0 && Ce.set(e.strings, (t = new X(e))), t);
  }
  k(e) {
    fe(this._$AH) || ((this._$AH = []), this._$AR());
    const t = this._$AH;
    let o,
      i = 0;
    for (const r of e)
      (i === t.length
        ? t.push((o = new Y(this.O(K()), this.O(K()), this, this.options)))
        : (o = t[i]),
        o._$AI(r),
        i++);
    i < t.length && (this._$AR(o && o._$AB.nextSibling, i), (t.length = i));
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var o;
    for (
      (o = this._$AP) == null ? void 0 : o.call(this, !1, !0, t);
      e !== this._$AB;
    ) {
      const i = e.nextSibling;
      (e.remove(), (e = i));
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 &&
      ((this._$Cv = e), (t = this._$AP) == null || t.call(this, e));
  }
}
class oe {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, o, i, r) {
    ((this.type = 1),
      (this._$AH = _),
      (this._$AN = void 0),
      (this.element = e),
      (this.name = t),
      (this._$AM = i),
      (this.options = r),
      o.length > 2 || o[0] !== "" || o[1] !== ""
        ? ((this._$AH = Array(o.length - 1).fill(new String())),
          (this.strings = o))
        : (this._$AH = _));
  }
  _$AI(e, t = this, o, i) {
    const r = this.strings;
    let n = !1;
    if (r === void 0)
      ((e = H(this, e, t, 0)),
        (n = !G(e) || (e !== this._$AH && e !== j)),
        n && (this._$AH = e));
    else {
      const d = e;
      let a, h;
      for (e = r[0], a = 0; a < r.length - 1; a++)
        ((h = H(this, d[o + a], t, a)),
          h === j && (h = this._$AH[a]),
          n || (n = !G(h) || h !== this._$AH[a]),
          h === _ ? (e = _) : e !== _ && (e += (h ?? "") + r[a + 1]),
          (this._$AH[a] = h));
    }
    n && !i && this.j(e);
  }
  j(e) {
    e === _
      ? this.element.removeAttribute(this.name)
      : this.element.setAttribute(this.name, e ?? "");
  }
}
class Xe extends oe {
  constructor() {
    (super(...arguments), (this.type = 3));
  }
  j(e) {
    this.element[this.name] = e === _ ? void 0 : e;
  }
}
class Ye extends oe {
  constructor() {
    (super(...arguments), (this.type = 4));
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== _);
  }
}
class Qe extends oe {
  constructor(e, t, o, i, r) {
    (super(e, t, o, i, r), (this.type = 5));
  }
  _$AI(e, t = this) {
    if ((e = H(this, e, t, 0) ?? _) === j) return;
    const o = this._$AH,
      i =
        (e === _ && o !== _) ||
        e.capture !== o.capture ||
        e.once !== o.once ||
        e.passive !== o.passive,
      r = e !== _ && (o === _ || i);
    (i && this.element.removeEventListener(this.name, this, o),
      r && this.element.addEventListener(this.name, this, e),
      (this._$AH = e));
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function"
      ? this._$AH.call(
          ((t = this.options) == null ? void 0 : t.host) ?? this.element,
          e,
        )
      : this._$AH.handleEvent(e);
  }
}
class et {
  constructor(e, t, o) {
    ((this.element = e),
      (this.type = 6),
      (this._$AN = void 0),
      (this._$AM = t),
      (this.options = o));
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    H(this, e);
  }
}
const pe = J.litHtmlPolyfillSupport;
(pe == null || pe(X, Y),
  (J.litHtmlVersions ?? (J.litHtmlVersions = [])).push("3.3.1"));
const tt = (s, e, t) => {
  const o = (t == null ? void 0 : t.renderBefore) ?? e;
  let i = o._$litPart$;
  if (i === void 0) {
    const r = (t == null ? void 0 : t.renderBefore) ?? null;
    o._$litPart$ = i = new Y(e.insertBefore(K(), r), r, void 0, t ?? {});
  }
  return (i._$AI(s), i);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const D = globalThis;
class x extends B {
  constructor() {
    (super(...arguments),
      (this.renderOptions = { host: this }),
      (this._$Do = void 0));
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (
      (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild),
      e
    );
  }
  update(e) {
    const t = this.render();
    (this.hasUpdated || (this.renderOptions.isConnected = this.isConnected),
      super.update(e),
      (this._$Do = tt(t, this.renderRoot, this.renderOptions)));
  }
  connectedCallback() {
    var e;
    (super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0));
  }
  disconnectedCallback() {
    var e;
    (super.disconnectedCallback(),
      (e = this._$Do) == null || e.setConnected(!1));
  }
  render() {
    return j;
  }
}
var Ee;
((x._$litElement$ = !0),
  (x.finalized = !0),
  (Ee = D.litElementHydrateSupport) == null || Ee.call(D, { LitElement: x }));
const ue = D.litElementPolyfillSupport;
ue == null || ue({ LitElement: x });
(D.litElementVersions ?? (D.litElementVersions = [])).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = (s) => (e, t) => {
  t !== void 0
    ? t.addInitializer(() => {
        customElements.define(s, e);
      })
    : customElements.define(s, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const it = {
    attribute: !0,
    type: String,
    converter: te,
    reflect: !1,
    hasChanged: ge,
  },
  st = (s = it, e, t) => {
    const { kind: o, metadata: i } = t;
    let r = globalThis.litPropertyMetadata.get(i);
    if (
      (r === void 0 &&
        globalThis.litPropertyMetadata.set(i, (r = /* @__PURE__ */ new Map())),
      o === "setter" && ((s = Object.create(s)).wrapped = !0),
      r.set(t.name, s),
      o === "accessor")
    ) {
      const { name: n } = t;
      return {
        set(d) {
          const a = e.get.call(this);
          (e.set.call(this, d), this.requestUpdate(n, a, s));
        },
        init(d) {
          return (d !== void 0 && this.C(n, void 0, s, d), d);
        },
      };
    }
    if (o === "setter") {
      const { name: n } = t;
      return function (d) {
        const a = this[n];
        (e.call(this, d), this.requestUpdate(n, a, s));
      };
    }
    throw Error("Unsupported decorator location: " + o);
  };
function m(s) {
  return (e, t) =>
    typeof t == "object"
      ? st(s, e, t)
      : ((o, i, r) => {
          const n = i.hasOwnProperty(r);
          return (
            i.constructor.createProperty(r, o),
            n ? Object.getOwnPropertyDescriptor(i, r) : void 0
          );
        })(s, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function p(s) {
  return m({ ...s, state: !0, attribute: !1 });
}
var ot = Object.defineProperty,
  rt = Object.getOwnPropertyDescriptor,
  w = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? rt(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && ot(e, t, i), i);
  };
let b = class extends x {
  constructor() {
    (super(...arguments),
      (this.open = !1),
      (this.entities = []),
      (this.preselected = null),
      (this._name = ""),
      (this._temperatureSensor = ""),
      (this._heaters = /* @__PURE__ */ new Set()),
      (this._coolers = /* @__PURE__ */ new Set()),
      (this._windowSensors = /* @__PURE__ */ new Set()),
      (this._roomType = "generic"));
  }
  updated(s) {
    if (s.has("open") && this.open && this.preselected) {
      const e = this.entities.find((t) => t.entity_id === this.preselected);
      if (e) {
        ((this._name = e.area_name || e.name || e.entity_id.split(".")[1]),
          this._heaters.clear(),
          this._coolers.clear(),
          this._windowSensors.clear());
        const t = this._name.toLowerCase();
        (t.includes("bedroom") || t.includes("sleeping")
          ? (this._roomType = "bedroom")
          : t.includes("living") || t.includes("lounge")
            ? (this._roomType = "living_room")
            : t.includes("office") || t.includes("study")
              ? (this._roomType = "office")
              : (this._roomType = "generic"),
          e.domain === "climate"
            ? (this._heaters.add(e.entity_id),
              (this._temperatureSensor = e.entity_id))
            : e.domain === "switch" && this._heaters.add(e.entity_id),
          this.requestUpdate());
      }
    }
  }
  _getEntityList(s) {
    return this.entities.filter((e) => s.includes(e.domain));
  }
  _toggleSet(s, e) {
    (s.has(e) ? s.delete(e) : s.add(e), this.requestUpdate());
  }
  _save() {
    if (!this._name || !this._temperatureSensor) {
      alert("Name and Temperature Sensor are required.");
      return;
    }
    (this.hass.callWS({
      type: "climate_dashboard/adopt",
      name: this._name,
      temperature_sensor: this._temperatureSensor,
      heaters: Array.from(this._heaters),
      coolers: Array.from(this._coolers),
      window_sensors: Array.from(this._windowSensors),
      room_type: this._roomType,
    }),
      this.dispatchEvent(new CustomEvent("close")));
  }
  render() {
    const s = this._getEntityList(["climate", "switch"]),
      e = this._getEntityList(["climate"]),
      t = this._getEntityList(["binary_sensor"]),
      o = this.entities.filter(
        (i) =>
          (i.domain === "sensor" && i.device_class === "temperature") ||
          i.domain === "climate",
      );
    return l`
      <div class="dialog">
        <h2>Adopt Zone</h2>

        <div class="field">
          <label>Zone Name</label>
          <input
            type="text"
            .value=${this._name}
            @input=${(i) => (this._name = i.target.value)}
          />
        </div>

        <div class="field">
          <label>Room Type (Smart Schedule)</label>
          <select
            .value=${this._roomType}
            @change=${(i) => (this._roomType = i.target.value)}
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
            @change=${(i) => (this._temperatureSensor = i.target.value)}
          >
            <option value="">Select Sensor</option>
            ${o.map(
              (i) => l`
                <option
                  value="${i.entity_id}"
                  ?selected=${this._temperatureSensor === i.entity_id}
                >
                  ${i.name || i.entity_id} (${i.entity_id})
                </option>
              `,
            )}
          </select>
        </div>

        <div class="field">
          <label>Heaters</label>
          <div class="checkbox-list">
            ${s.map(
              (i) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._heaters.has(i.entity_id)}
                    @change=${() => this._toggleSet(this._heaters, i.entity_id)}
                  />
                  <span>${i.name || i.entity_id} (${i.domain})</span>
                </div>
              `,
            )}
          </div>
        </div>

        <div class="field">
          <label>Coolers</label>
          <div class="checkbox-list">
            ${e.map(
              (i) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._coolers.has(i.entity_id)}
                    @change=${() => this._toggleSet(this._coolers, i.entity_id)}
                  />
                  <span>${i.name || i.entity_id}</span>
                </div>
              `,
            )}
          </div>
        </div>

        <div class="field">
          <label>Window Sensors</label>
          <div class="checkbox-list">
            ${t.map(
              (i) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._windowSensors.has(i.entity_id)}
                    @change=${() => this._toggleSet(this._windowSensors, i.entity_id)}
                  />
                  <span>${i.name || i.entity_id}</span>
                </div>
              `,
            )}
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
b.styles = I`
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
    h2 {
      margin-top: 0;
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
w([m({ attribute: !1 })], b.prototype, "hass", 2);
w([m({ type: Boolean, reflect: !0 })], b.prototype, "open", 2);
w([m({ attribute: !1 })], b.prototype, "entities", 2);
w([m({ attribute: !1 })], b.prototype, "preselected", 2);
w([p()], b.prototype, "_name", 2);
w([p()], b.prototype, "_temperatureSensor", 2);
w([p()], b.prototype, "_heaters", 2);
w([p()], b.prototype, "_coolers", 2);
w([p()], b.prototype, "_windowSensors", 2);
w([p()], b.prototype, "_roomType", 2);
b = w([z("adopt-dialog")], b);
var nt = Object.defineProperty,
  at = Object.getOwnPropertyDescriptor,
  R = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? at(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && nt(e, t, i), i);
  };
let E = class extends x {
  constructor() {
    (super(...arguments),
      (this._devices = []),
      (this._loading = !1),
      (this._dialogOpen = !1),
      (this._selectedEntity = null));
  }
  firstUpdated() {
    this._fetchDevices();
  }
  async _fetchDevices() {
    if (this.hass) {
      this._loading = !0;
      try {
        this._devices = await this.hass.callWS({
          type: "climate_dashboard/scan",
        });
      } catch (s) {
        console.error("Failed to fetch devices", s);
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
    const s = this._devices.filter((e) =>
      ["climate", "switch"].includes(e.domain),
    );
    return s.length === 0
      ? l`<div class="empty">No unmanaged actuators found.</div>`
      : l`
      <div class="list">
        ${s.map(
          (e) => l`
            <div class="item">
              <div class="item-info">
                <span class="icon">
                  <ha-icon
                    icon="${e.domain === "switch" ? "mdi:power-socket" : "mdi:thermostat"}"
                  ></ha-icon>
                </span>
                <div>
                  <div>${e.name || e.entity_id}</div>
                  <div
                    style="font-size: 0.8em; color: var(--secondary-text-color); display: flex; align-items: center; margin-top: 2px;"
                  >
                    ${
                      e.area_name
                        ? l`<span class="area-badge"
                          >${e.area_name}</span
                        >`
                        : ""
                    }
                    ${e.entity_id} • ${e.state}
                  </div>
                </div>
              </div>
              <button
                class="adopt-btn"
                @click=${() => this._openDialog(e.entity_id)}
              >
                Adopt
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }
  _openDialog(s) {
    ((this._selectedEntity = s), (this._dialogOpen = !0));
  }
  _closeDialog() {
    ((this._dialogOpen = !1),
      (this._selectedEntity = null),
      this._fetchDevices());
  }
};
E.styles = I`
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
R([m({ attribute: !1 })], E.prototype, "hass", 2);
R([p()], E.prototype, "_devices", 2);
R([p()], E.prototype, "_loading", 2);
R([p()], E.prototype, "_dialogOpen", 2);
R([p()], E.prototype, "_selectedEntity", 2);
E = R([z("setup-view")], E);
var lt = Object.defineProperty,
  dt = Object.getOwnPropertyDescriptor,
  re = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? dt(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && lt(e, t, i), i);
  };
let L = class extends x {
  constructor() {
    (super(...arguments),
      (this._selectedDay = /* @__PURE__ */ new Date()
        .toLocaleDateString("en-US", { weekday: "short" })
        .toLowerCase()));
  }
  render() {
    if (!this.hass) return l``;
    let s = Object.values(this.hass.states).filter(
      (o) => o.attributes.is_climate_dashboard_zone,
    );
    this.focusZoneId && (s = s.filter((o) => o.entity_id === this.focusZoneId));
    const e = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      t = /* @__PURE__ */ new Date()
        .toLocaleDateString("en-US", { weekday: "short" })
        .toLowerCase();
    return l`
      <div class="card">
        <h2>Timeline</h2>

        <div class="day-selector">
          ${e.map(
            (o) => l`
              <button
                class="day-tab ${this._selectedDay === o ? "active" : ""}"
                @click=${() => (this._selectedDay = o)}
              >
                ${o.toUpperCase()}
              </button>
            `,
          )}
        </div>

        ${
          s.length === 0
            ? l`<p>No zones adopted yet.</p>`
            : l`
              <div class="timeline-container">
                <!-- Time Axis -->
                <div class="time-axis">
                  <div class="time-axis-spacer"></div>
                  <div class="time-axis-track">
                    ${[0, 4, 8, 12, 16, 20, 24].map(
                      (o) => l`
                        <div
                          class="time-marker"
                          style="left: ${(o / 24) * 100}%"
                        >
                          ${o.toString().padStart(2, "0")}:00
                        </div>
                      `,
                    )}
                  </div>
                </div>

                <!-- Zones -->
                ${s.map((o) => this._renderZoneRow(o, this._selectedDay))}

                <!-- Current Time Indicator (Only show if viewing today) -->
                ${this._selectedDay === t ? this._renderCurrentTimeLine() : ""}
              </div>
            `
        }
      </div>
    `;
  }
  _renderZoneRow(s, e) {
    return l`
      <div class="zone-row" @click=${() => this._editSchedule(s.entity_id)}>
        <div class="zone-label">
          <div>${s.attributes.friendly_name || s.entity_id}</div>
          <div class="temp">
            ${s.attributes.current_temperature ?? "--"}°C ->
            ${s.attributes.temperature}°C
          </div>
        </div>

        <div class="timeline-track">
          ${this._renderBlocks(s, e)}
        </div>
      </div>
    `;
  }
  _renderBlocks(s, e) {
    const t = s.attributes.schedule || [],
      o = (s.attributes.heaters || []).length > 0,
      i = (s.attributes.coolers || []).length > 0;
    let r = "off";
    o && i ? (r = "auto") : o ? (r = "heat") : i && (r = "cool");
    const n = t.filter((a) => a.days.includes(e));
    if (
      (n.sort((a, h) => a.start_time.localeCompare(h.start_time)),
      (n.length > 0 ? n[0].start_time : "24:00") > "00:00")
    ) {
      const a = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        h = a.indexOf(e);
      let u = null;
      for (let c = 1; c <= 7; c++) {
        const f = (h - c + 7) % 7,
          v = a[f],
          $ = t.filter((Z) => Z.days.includes(v));
        if ($.length > 0) {
          ($.sort((Z, ne) => Z.start_time.localeCompare(ne.start_time)),
            (u = $[$.length - 1]));
          break;
        }
      }
      if (u) {
        const c = {
          ...u,
          start_time: "00:00",
          name: `Carry-over (${u.name})`,
          // We render this block effectively from 00:00 to the start of the next block
        };
        n.unshift(c);
      }
    }
    return n.map((a, h) => {
      const [u, c] = a.start_time.split(":").map(Number),
        f = u * 60 + c;
      let v = 1440;
      if (h < n.length - 1) {
        const W = n[h + 1],
          [Ue, Me] = W.start_time.split(":").map(Number);
        v = Ue * 60 + Me;
      }
      const $ = v - f,
        Z = (f / 1440) * 100,
        ne = ($ / 1440) * 100;
      let N = "";
      const Q = a.temp_heat ?? a.target_temp,
        ae = a.temp_cool ?? a.target_temp,
        le = 16,
        de = 24;
      let q = 1;
      if (r === "heat") {
        N = `${Q}°`;
        const W = (Q - le) / (de - le);
        q = 0.4 + 0.6 * Math.min(Math.max(W, 0), 1);
      } else if (r === "cool") {
        N = `${ae}°`;
        const W = (de - ae) / (de - le);
        q = 0.4 + 0.6 * Math.min(Math.max(W, 0), 1);
      } else
        r === "auto"
          ? ((N = `${Q}-${ae}°`), (q = 0.9))
          : ((N = `${Q}°`), (q = 0.5));
      return l`
        <div
          class="schedule-block mode-${r}"
          style="left: ${Z}%; width: ${ne}%; opacity: ${q.toFixed(2)};"
          title="${a.name}: ${a.start_time} (${N})"
        >
          ${N}
        </div>
      `;
    });
  }
  _renderCurrentTimeLine() {
    const s = /* @__PURE__ */ new Date(),
      t = ((s.getHours() * 60 + s.getMinutes()) / 1440) * 100;
    return l`
      <div
        class="current-time-line"
        style="left: calc(136px + (100% - 136px) * ${t / 100})"
      ></div>
    `;
  }
  _editSchedule(s) {
    this.dispatchEvent(
      new CustomEvent("schedule-selected", {
        detail: { entityId: s },
        bubbles: !0,
        composed: !0,
      }),
    );
  }
};
L.styles = I`
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
    }
    .schedule-block:hover {
      opacity: 0.9;
      z-index: 2;
    }
    /* Colors */
    .mode-heat {
      background-color: var(--deep-orange-color, #ff5722);
    }
    .mode-cool {
      background-color: var(--blue-color, #2196f3);
    }
    .mode-off {
      background-color: var(--grey-color, #9e9e9e);
    }
    .mode-auto {
      background: linear-gradient(to bottom, var(--blue-color, #2196f3) 50%, var(--deep-orange-color, #ff5722) 50%);
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
  `;
re([m({ attribute: !1 })], L.prototype, "hass", 2);
re([m()], L.prototype, "focusZoneId", 2);
re([p()], L.prototype, "_selectedDay", 2);
L = re([z("timeline-view")], L);
var ct = Object.defineProperty,
  ht = Object.getOwnPropertyDescriptor,
  ze = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? ht(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && ct(e, t, i), i);
  };
let se = class extends x {
  render() {
    const s = this._getZones();
    return s.length === 0
      ? l`
        <div class="empty">
          <p>No zones configured yet.</p>
          <p>Use the Setup button above to adopt devices.</p>
        </div>
      `
      : l`
      <div class="grid">${s.map((e) => this._renderZoneCard(e))}</div>
    `;
  }
  _getZones() {
    return this.hass
      ? Object.values(this.hass.states).filter((s) =>
          s.entity_id.startsWith("climate.zone_"),
        )
      : [];
  }
  _renderZoneCard(s) {
    const e = s.attributes.hvac_action;
    let t = "mdi:thermostat",
      o = "";
    e === "heating"
      ? ((t = "mdi:fire"), (o = "var(--deep-orange-color, #ff5722)"))
      : e === "cooling"
        ? ((t = "mdi:snowflake"), (o = "var(--blue-color, #2196f3)"))
        : s.state === "heat"
          ? ((t = "mdi:fire"), (o = "var(--primary-text-color)"))
          : s.state === "auto" && (t = "mdi:calendar-clock");
    const i = s.attributes.current_temperature;
    return l`
      <div class="card" @click=${() => this._openDetails(s.entity_id)}>
        <button
          class="settings-btn"
          @click=${(r) => this._openSettings(r, s.entity_id)}
        >
          <ha-icon icon="mdi:cog"></ha-icon>
        </button>

        <div class="icon" style="color: ${o || "inherit"}">
          <ha-icon icon="${t}"></ha-icon>
        </div>
        <div class="name">
          ${s.attributes.friendly_name || s.entity_id}
        </div>
        <div class="temp">
          ${i != null ? `${i}°` : "--"}
        </div>
        <div class="state">
          ${e ? l`${e}` : l`${s.state}`}
        </div>

        ${this._renderStatus(s)}

        <div class="actions">
          <button
            class="mode-btn ${s.state === "off" ? "active" : ""}"
            @click=${(r) => this._setMode(r, s.entity_id, "off")}
          >
            Off
          </button>

          <button
            class="mode-btn ${s.state === "auto" ? "active" : ""}"
            @click=${(r) => this._setMode(r, s.entity_id, "auto")}
          >
            Auto
          </button>
        </div>
      </div>
    `;
  }
  _renderStatus(s) {
    const e = s.attributes.next_scheduled_change,
      t = s.attributes.manual_override_end,
      o = s.state;
    let i = "";
    if (t)
      i = `Overridden until ${new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    else if (o === "auto" && e) {
      const r = new Date(e).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        n = s.attributes.next_scheduled_temp;
      n != null ? (i = `${r} -> ${n}°`) : (i = `${r}`);
    }
    return i
      ? l`
      <div
        style="font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px;"
      >
        ${i}
      </div>
    `
      : l``;
  }
  async _setMode(s, e, t) {
    (s.stopPropagation(),
      await this.hass.callService("climate", "set_hvac_mode", {
        entity_id: e,
        hvac_mode: t,
      }));
  }
  _openDetails(s) {
    this.dispatchEvent(
      new CustomEvent("zone-details", {
        detail: { entityId: s },
        bubbles: !0,
        composed: !0,
      }),
    );
  }
  _openSettings(s, e) {
    (s.stopPropagation(),
      this.dispatchEvent(
        new CustomEvent("zone-settings", {
          detail: { entityId: e },
          bubbles: !0,
          composed: !0,
        }),
      ));
  }
};
se.styles = I`
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
  `;
ze([m({ attribute: !1 })], se.prototype, "hass", 2);
se = ze([z("zones-view")], se);
var pt = Object.defineProperty,
  ut = Object.getOwnPropertyDescriptor,
  y = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? ut(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && pt(e, t, i), i);
  };
let g = class extends x {
  constructor() {
    (super(...arguments),
      (this.allEntities = []),
      (this._uniqueId = ""),
      (this._name = ""),
      (this._temperatureSensor = ""),
      (this._heaters = /* @__PURE__ */ new Set()),
      (this._coolers = /* @__PURE__ */ new Set()),
      (this._windowSensors = /* @__PURE__ */ new Set()),
      (this._restoreDelayMinutes = 0),
      (this._loading = !1),
      (this._error = ""));
  }
  async firstUpdated() {
    await this._loadConfig();
  }
  async _loadConfig() {
    if (!this.hass || !this.zoneId) return;
    ((this._loading = !0),
      console.log("Loading config for zoneId:", this.zoneId));
    const s = this.hass.states[this.zoneId];
    if (!s) {
      (console.error("Zone state not found for:", this.zoneId),
        (this._error = "Zone not found"),
        (this._loading = !1));
      return;
    }
    if ((console.log("Zone Attributes:", s.attributes), s.attributes.unique_id))
      this._uniqueId = s.attributes.unique_id;
    else
      try {
        const r = await this.hass.callWS({
          type: "config/entity_registry/get",
          entity_id: this.zoneId,
        });
        this._uniqueId = r.unique_id;
      } catch (r) {
        console.warn("Could not fetch registry entry:", r);
      }
    if (!this._uniqueId) {
      ((this._error = "Could not determine Unique ID"), (this._loading = !1));
      return;
    }
    const e = s.attributes;
    ((this._name = e.friendly_name || ""),
      (this._temperatureSensor =
        e.temperature_sensor || e.sensor_entity_id || ""));
    const t = e.heaters || (e.actuator_entity_id ? [e.actuator_entity_id] : []);
    this._heaters = new Set(t);
    const o = e.coolers || [];
    this._coolers = new Set(o);
    const i = e.window_sensors || [];
    ((this._windowSensors = new Set(i)),
      (this._restoreDelayMinutes = e.restore_delay_minutes || 0),
      console.log("Loaded Config:", {
        name: this._name,
        temp: this._temperatureSensor,
        heaters: this._heaters,
        coolers: this._coolers,
        restore: this._restoreDelayMinutes,
      }),
      (this._loading = !1));
  }
  _toggleSet(s, e) {
    (s.has(e) ? s.delete(e) : s.add(e), this.requestUpdate());
  }
  _getEntityList(s) {
    return this.allEntities.filter((e) => s.includes(e.domain));
  }
  async _save() {
    if (!this._name || !this._temperatureSensor) {
      alert("Name and Temperature Sensor are required.");
      return;
    }
    try {
      (await this.hass.callWS({
        type: "climate_dashboard/update",
        unique_id: this._uniqueId,
        name: this._name,
        temperature_sensor: this._temperatureSensor,
        heaters: Array.from(this._heaters),
        coolers: Array.from(this._coolers),
        window_sensors: Array.from(this._windowSensors),
        restore_delay_minutes: Number(this._restoreDelayMinutes),
      }),
        this._goBack());
    } catch (s) {
      alert("Update failed: " + s.message);
    }
  }
  async _delete() {
    if (confirm("Are you sure you want to delete this zone?"))
      try {
        (await this.hass.callWS({
          type: "climate_dashboard/delete",
          unique_id: this._uniqueId,
        }),
          this._goBack());
      } catch (s) {
        alert("Delete failed: " + s.message);
      }
  }
  _goBack() {
    this.dispatchEvent(new CustomEvent("close"));
  }
  render() {
    if (this._loading) return l`<div class="card">Loading...</div>`;
    if (this._error) return l`<div class="card">Error: ${this._error}</div>`;
    const s = this._getEntityList(["climate", "switch"]),
      e = this._getEntityList(["climate"]),
      t = this._getEntityList(["binary_sensor"]),
      o = this.allEntities.filter(
        (i) =>
          (i.domain === "sensor" && i.device_class === "temperature") ||
          i.domain === "climate",
      );
    return l`
      <div class="card">
        <h2>Edit Zone: ${this._name}</h2>

        <div class="field">
          <label>Zone Name</label>
          <input
            type="text"
            .value=${this._name}
            @input=${(i) => (this._name = i.target.value)}
          />
        </div>

        <div class="field">
          <label>Temperature Sensor</label>
          <select
            @change=${(i) => (this._temperatureSensor = i.target.value)}
          >
            <option value="">Select Sensor</option>
            ${o.map(
              (i) => l`
                <option
                  value="${i.entity_id}"
                  ?selected=${this._temperatureSensor === i.entity_id}
                >
                  ${i.name || i.entity_id} (${i.entity_id})
                </option>
              `,
            )}
          </select>
        </div>

        <div class="field">
          <label>Heaters</label>
          <div class="checkbox-list">
            ${s.map(
              (i) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._heaters.has(i.entity_id)}
                    @change=${() => this._toggleSet(this._heaters, i.entity_id)}
                  />
                  <span>${i.name} (${i.entity_id})</span>
                </div>
              `,
            )}
          </div>
        </div>

        <div class="field">
          <label>Coolers</label>
          <div class="checkbox-list">
            ${e.map(
              (i) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._coolers.has(i.entity_id)}
                    @change=${() => this._toggleSet(this._coolers, i.entity_id)}
                  />
                  <span>${i.name || i.entity_id}</span>
                </div>
              `,
            )}
          </div>
        </div>

        <div class="field">
          <label>Window Sensors</label>
          <div class="checkbox-list">
            ${t.map(
              (i) => l`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._windowSensors.has(i.entity_id)}
                    @change=${() => this._toggleSet(this._windowSensors, i.entity_id)}
                  />
                  <span>${i.name || i.entity_id}</span>
                </div>
              `,
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
            @input=${(i) => (this._restoreDelayMinutes = i.target.value)}
          />
        </div>

        <div class="actions">
          <button class="delete" @click=${this._delete}>Delete Helper</button>
          <button class="cancel" @click=${this._goBack}>Cancel</button>
          <button class="save" @click=${this._save}>Save Changes</button>
        </div>
      </div>
    `;
  }
};
g.styles = I`
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
    .delete {
      background: var(--error-color, #f44336);
      color: white;
      margin-right: auto;
    }
  `;
y([m({ attribute: !1 })], g.prototype, "hass", 2);
y([m({ attribute: !1 })], g.prototype, "zoneId", 2);
y([m({ attribute: !1 })], g.prototype, "allEntities", 2);
y([p()], g.prototype, "_uniqueId", 2);
y([p()], g.prototype, "_name", 2);
y([p()], g.prototype, "_temperatureSensor", 2);
y([p()], g.prototype, "_heaters", 2);
y([p()], g.prototype, "_coolers", 2);
y([p()], g.prototype, "_windowSensors", 2);
y([p()], g.prototype, "_restoreDelayMinutes", 2);
y([p()], g.prototype, "_loading", 2);
y([p()], g.prototype, "_error", 2);
g = y([z("zone-editor")], g);
var _t = Object.defineProperty,
  mt = Object.getOwnPropertyDescriptor,
  U = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? mt(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && _t(e, t, i), i);
  };
const gt = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
let S = class extends x {
  constructor() {
    (super(...arguments),
      (this._schedule = []),
      (this._loading = !1),
      (this._uniqueId = ""),
      (this._config = {}));
  }
  async firstUpdated() {
    await this._loadConfig();
  }
  async _loadConfig() {
    if (!(!this.hass || !this.zoneId)) {
      this._loading = !0;
      try {
        const s = await this.hass.callWS({
          type: "config/entity_registry/get",
          entity_id: this.zoneId,
        });
        this._uniqueId = s.unique_id;
        const e = this.hass.states[this.zoneId];
        if (e && e.attributes.schedule) {
          const t = JSON.parse(JSON.stringify(e.attributes.schedule));
          ((this._schedule = t.map((o) => ({
            ...o,
            temp_heat: o.temp_heat ?? o.target_temp ?? 20,
            temp_cool: o.temp_cool ?? o.target_temp ?? 24,
          }))),
            (this._config = {
              name: e.attributes.friendly_name,
              temperature_sensor: e.attributes.temperature_sensor,
              heaters: e.attributes.heaters || [],
              coolers: e.attributes.coolers || [],
              window_sensors: e.attributes.window_sensors || [],
            }));
        }
      } catch (s) {
        (console.error(s), alert("Failed to load schedule"));
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
        days: ["mon", "tue", "wed", "thu", "fri"],
      },
    ];
  }
  _removeBlock(s) {
    this._schedule = this._schedule.filter((e, t) => t !== s);
  }
  _updateBlock(s, e, t) {
    const o = [...this._schedule];
    ((o[s] = { ...o[s], [e]: t }), (this._schedule = o));
  }
  _toggleDay(s, e) {
    const t = this._schedule[s],
      o = new Set(t.days);
    (o.has(e) ? o.delete(e) : o.add(e),
      this._updateBlock(s, "days", Array.from(o)));
  }
  async _save() {
    try {
      (await this.hass.callWS({
        type: "climate_dashboard/update",
        unique_id: this._uniqueId,
        name: this._config.name,
        // Required fields
        temperature_sensor: this._config.temperature_sensor,
        heaters: this._config.heaters,
        coolers: this._config.coolers,
        window_sensors: this._config.window_sensors,
        schedule: this._schedule,
      }),
        this.dispatchEvent(new CustomEvent("close")));
    } catch (s) {
      alert("Save failed: " + s.message);
    }
  }
  render() {
    return this._loading
      ? l`<div>Loading...</div>`
      : l`
      <div class="card">
        <h2>Schedule: ${this._config.name}</h2>
        <div class="block-list">
          ${this._schedule.map(
            (s, e) => l`
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
                      .value=${s.name}
                      @input=${(t) => this._updateBlock(e, "name", t.target.value)}
                    />
                  </div>
                  <div class="field">
                    <label>Start Time</label>
                    <input
                      type="time"
                      .value=${s.start_time}
                      @input=${(t) => this._updateBlock(e, "start_time", t.target.value)}
                    />
                  </div>
                  <div class="field">
                    <label>Heat To (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      .value=${s.temp_heat ?? 20}
                      @input=${(t) =>
                        this._updateBlock(
                          e,
                          "temp_heat",
                          parseFloat(t.target.value),
                        )}
                    />
                  </div>
                  <div class="field">
                    <label>Cool To (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      .value=${s.temp_cool ?? 24}
                      @input=${(t) =>
                        this._updateBlock(
                          e,
                          "temp_cool",
                          parseFloat(t.target.value),
                        )}
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="field" style="flex: 2;">
                    <label>Days</label>
                    <div class="days-selector">
                      ${gt.map(
                        (t) => l`
                          <button
                            class="day-btn ${s.days.includes(t) ? "active" : ""}"
                            @click=${() => this._toggleDay(e, t)}
                          >
                            ${t.toUpperCase()}
                          </button>
                        `,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            `,
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
S.styles = I`
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
U([m({ attribute: !1 })], S.prototype, "hass", 2);
U([m({ attribute: !1 })], S.prototype, "zoneId", 2);
U([p()], S.prototype, "_schedule", 2);
U([p()], S.prototype, "_loading", 2);
U([p()], S.prototype, "_uniqueId", 2);
U([p()], S.prototype, "_config", 2);
S = U([z("schedule-editor")], S);
var ft = Object.defineProperty,
  vt = Object.getOwnPropertyDescriptor,
  M = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? vt(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && ft(e, t, i), i);
  };
let A = class extends x {
  constructor() {
    (super(...arguments),
      (this._view = "zones"),
      (this._editingZoneId = null),
      (this._unmanagedCount = 0));
  }
  // ... (omitted) ...
  firstUpdated() {
    this._scanForBadge();
  }
  async _scanForBadge() {
    if (this.hass)
      try {
        const e = (
          await this.hass.callWS({
            type: "climate_dashboard/scan",
          })
        ).filter((t) => ["climate", "switch"].includes(t.domain));
        this._unmanagedCount = e.length;
      } catch (s) {
        console.error("Badge scan failed", s);
      }
  }
  _getEditorCandidates() {
    if (!this.hass) return [];
    const s = ["climate", "switch", "sensor", "binary_sensor"];
    return Object.values(this.hass.states)
      .filter(
        (e) =>
          s.includes(e.entity_id.split(".")[0]) &&
          !e.attributes.is_climate_dashboard_zone &&
          !e.entity_id.startsWith("climate.zone_"),
      )
      .map((e) => ({
        entity_id: e.entity_id,
        domain: e.entity_id.split(".")[0],
        name: e.attributes.friendly_name || e.entity_id,
        device_class: e.attributes.device_class,
        // area_name missing, but acceptable for MVP
      }));
  }
  render() {
    return l`
      <div class="header">
        ${
          this._view !== "zones"
            ? l`
              <button
                class="icon-btn"
                @click=${() => {
                  this._view === "schedule"
                    ? ((this._view = "timeline"), (this._editingZoneId = null))
                    : ((this._view = "zones"), (this._editingZoneId = null));
                }}
              >
                <ha-icon icon="mdi:arrow-left"></ha-icon>
              </button>
            `
            : l`<ha-menu-button
              .hass=${this.hass}
              .narrow=${this.narrow}
            ></ha-menu-button>`
        }

        <div class="title">Climate</div>

        <div class="actions">
          <!-- Timeline Toggle -->
          <button
            class="icon-btn ${this._view === "timeline" ? "active" : ""}"
            @click=${() => (this._view = "timeline")}
          >
            <ha-icon icon="mdi:chart-timeline"></ha-icon>
          </button>

          <!-- Setup Toggle (Badge) -->
          <button
            class="icon-btn ${this._view === "setup" ? "active" : ""}"
            @click=${() => (this._view = "setup")}
          >
            <ha-icon icon="mdi:cog"></ha-icon>
            ${this._unmanagedCount > 0 ? l`<span class="badge">${this._unmanagedCount}</span>` : ""}
          </button>
        </div>
      </div>

      <div class="content">
        ${
          this._view === "zones"
            ? l`<zones-view
              .hass=${this.hass}
              @zone-settings=${(s) => {
                ((this._editingZoneId = s.detail.entityId),
                  (this._view = "editor"));
              }}
              @zone-details=${(s) => {
                ((this._editingZoneId = s.detail.entityId),
                  (this._view = "timeline"));
              }}
            ></zones-view>`
            : ""
        }
        ${this._view === "setup" ? l`<setup-view .hass=${this.hass}></setup-view>` : ""}
        ${
          this._view === "timeline"
            ? l` <timeline-view
              .hass=${this.hass}
              .focusZoneId=${this._editingZoneId}
              @schedule-selected=${(s) => {
                ((this._editingZoneId = s.detail.entityId),
                  (this._view = "schedule"));
              }}
            ></timeline-view>`
            : ""
        }
        ${
          this._view === "editor" && this._editingZoneId
            ? l`
              <zone-editor
                .hass=${this.hass}
                .zoneId=${this._editingZoneId}
                .allEntities=${this._getEditorCandidates()}
                @close=${() => {
                  ((this._view = "zones"), (this._editingZoneId = null));
                }}
              ></zone-editor>
            `
            : ""
        }
        ${
          this._view === "schedule" && this._editingZoneId
            ? l`
              <schedule-editor
                .hass=${this.hass}
                .zoneId=${this._editingZoneId}
                @close=${() => {
                  ((this._view = "timeline"), (this._editingZoneId = null));
                }}
              ></schedule-editor>
            `
            : ""
        }
      </div>
    `;
  }
};
A.styles = I`
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
M([m({ attribute: !1 })], A.prototype, "hass", 2);
M([m({ attribute: !1 })], A.prototype, "narrow", 2);
M([m({ attribute: !1 })], A.prototype, "panel", 2);
M([p()], A.prototype, "_view", 2);
M([p()], A.prototype, "_editingZoneId", 2);
M([p()], A.prototype, "_unmanagedCount", 2);
A = M([z("climate-dashboard")], A);
console.info(
  "%c CLIMATE-DASHBOARD %c 0.0.1 ",
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;",
);
