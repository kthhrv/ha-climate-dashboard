/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis,
  re =
    K.ShadowRoot &&
    (K.ShadyCSS === void 0 || K.ShadyCSS.nativeShadow) &&
    "adoptedStyleSheets" in Document.prototype &&
    "replace" in CSSStyleSheet.prototype,
  ne = Symbol(),
  de = /* @__PURE__ */ new WeakMap();
let ye = class {
  constructor(e, t, o) {
    if (((this._$cssResult$ = !0), o !== ne))
      throw Error(
        "CSSResult is not constructable. Use `unsafeCSS` or `css` instead.",
      );
    ((this.cssText = e), (this.t = t));
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (re && e === void 0) {
      const o = t !== void 0 && t.length === 1;
      (o && (e = de.get(t)),
        e === void 0 &&
          ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText),
          o && de.set(t, e)));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ke = (s) => new ye(typeof s == "string" ? s : s + "", void 0, ne),
  z = (s, ...e) => {
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
    return new ye(t, s, ne);
  },
  Ee = (s, e) => {
    if (re)
      s.adoptedStyleSheets = e.map((t) =>
        t instanceof CSSStyleSheet ? t : t.styleSheet,
      );
    else
      for (const t of e) {
        const o = document.createElement("style"),
          i = K.litNonce;
        (i !== void 0 && o.setAttribute("nonce", i),
          (o.textContent = t.cssText),
          s.appendChild(o));
      }
  },
  ce = re
    ? (s) => s
    : (s) =>
        s instanceof CSSStyleSheet
          ? ((e) => {
              let t = "";
              for (const o of e.cssRules) t += o.cssText;
              return ke(t);
            })(s)
          : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const {
    is: Ce,
    defineProperty: Pe,
    getOwnPropertyDescriptor: Oe,
    getOwnPropertyNames: De,
    getOwnPropertySymbols: ze,
    getPrototypeOf: Ie,
  } = Object,
  k = globalThis,
  he = k.trustedTypes,
  Ue = he ? he.emptyScript : "",
  te = k.reactiveElementPolyfillSupport,
  R = (s, e) => s,
  Y = {
    toAttribute(s, e) {
      switch (e) {
        case Boolean:
          s = s ? Ue : null;
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
  ae = (s, e) => !Ce(s, e),
  pe = {
    attribute: !0,
    type: String,
    converter: Y,
    reflect: !1,
    useDefault: !1,
    hasChanged: ae,
  };
(Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")),
  k.litPropertyMetadata ??
    (k.litPropertyMetadata = /* @__PURE__ */ new WeakMap()));
let j = class extends HTMLElement {
  static addInitializer(e) {
    (this._$Ei(), (this.l ?? (this.l = [])).push(e));
  }
  static get observedAttributes() {
    return (this.finalize(), this._$Eh && [...this._$Eh.keys()]);
  }
  static createProperty(e, t = pe) {
    if (
      (t.state && (t.attribute = !1),
      this._$Ei(),
      this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0),
      this.elementProperties.set(e, t),
      !t.noAccessor)
    ) {
      const o = Symbol(),
        i = this.getPropertyDescriptor(e, o, t);
      i !== void 0 && Pe(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, t, o) {
    const { get: i, set: r } = Oe(this.prototype, e) ?? {
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
    return this.elementProperties.get(e) ?? pe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(R("elementProperties"))) return;
    const e = Ie(this);
    (e.finalize(),
      e.l !== void 0 && (this.l = [...e.l]),
      (this.elementProperties = new Map(e.elementProperties)));
  }
  static finalize() {
    if (this.hasOwnProperty(R("finalized"))) return;
    if (
      ((this.finalized = !0), this._$Ei(), this.hasOwnProperty(R("properties")))
    ) {
      const t = this.properties,
        o = [...De(t), ...ze(t)];
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
      for (const i of o) t.unshift(ce(i));
    } else e !== void 0 && t.push(ce(e));
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
    return (Ee(e, this.constructor.elementStyles), e);
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
          : Y
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
              : Y;
      this._$Em = i;
      const p = a.fromAttribute(t, d.type);
      ((this[i] = p ?? ((n = this._$Ej) == null ? void 0 : n.get(i)) ?? p),
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
          (o.hasChanged ?? ae)(n, t) ||
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
((j.elementStyles = []),
  (j.shadowRootOptions = { mode: "open" }),
  (j[R("elementProperties")] = /* @__PURE__ */ new Map()),
  (j[R("finalized")] = /* @__PURE__ */ new Map()),
  te == null || te({ ReactiveElement: j }),
  (k.reactiveElementVersions ?? (k.reactiveElementVersions = [])).push(
    "2.1.1",
  ));
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const q = globalThis,
  G = q.trustedTypes,
  ue = G ? G.createPolicy("lit-html", { createHTML: (s) => s }) : void 0,
  $e = "$lit$",
  A = `lit$${Math.random().toFixed(9).slice(2)}$`,
  xe = "?" + A,
  Te = `<${xe}>`,
  D = document,
  W = () => D.createComment(""),
  V = (s) => s === null || (typeof s != "object" && typeof s != "function"),
  le = Array.isArray,
  Me = (s) =>
    le(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function",
  ie = `[ 	
\f\r]`,
  Z = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
  _e = /-->/g,
  me = />/g,
  C = RegExp(
    `>|${ie}(?:([^\\s"'>=/]+)(${ie}*=${ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,
    "g",
  ),
  ge = /'/g,
  ve = /"/g,
  we = /^(?:script|style|textarea|title)$/i,
  je =
    (s) =>
    (e, ...t) => ({ _$litType$: s, strings: e, values: t }),
  l = je(1),
  N = Symbol.for("lit-noChange"),
  _ = Symbol.for("lit-nothing"),
  fe = /* @__PURE__ */ new WeakMap(),
  P = D.createTreeWalker(D, 129);
function Se(s, e) {
  if (!le(s) || !s.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return ue !== void 0 ? ue.createHTML(e) : e;
}
const Ne = (s, e) => {
  const t = s.length - 1,
    o = [];
  let i,
    r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "",
    n = Z;
  for (let d = 0; d < t; d++) {
    const a = s[d];
    let p,
      u,
      c = -1,
      b = 0;
    for (; b < a.length && ((n.lastIndex = b), (u = n.exec(a)), u !== null); )
      ((b = n.lastIndex),
        n === Z
          ? u[1] === "!--"
            ? (n = _e)
            : u[1] !== void 0
              ? (n = me)
              : u[2] !== void 0
                ? (we.test(u[2]) && (i = RegExp("</" + u[2], "g")), (n = C))
                : u[3] !== void 0 && (n = C)
          : n === C
            ? u[0] === ">"
              ? ((n = i ?? Z), (c = -1))
              : u[1] === void 0
                ? (c = -2)
                : ((c = n.lastIndex - u[2].length),
                  (p = u[1]),
                  (n = u[3] === void 0 ? C : u[3] === '"' ? ve : ge))
            : n === ve || n === ge
              ? (n = C)
              : n === _e || n === me
                ? (n = Z)
                : ((n = C), (i = void 0)));
    const $ = n === C && s[d + 1].startsWith("/>") ? " " : "";
    r +=
      n === Z
        ? a + Te
        : c >= 0
          ? (o.push(p), a.slice(0, c) + $e + a.slice(c) + A + $)
          : a + A + (c === -2 ? d : $);
  }
  return [
    Se(
      s,
      r + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : ""),
    ),
    o,
  ];
};
class F {
  constructor({ strings: e, _$litType$: t }, o) {
    let i;
    this.parts = [];
    let r = 0,
      n = 0;
    const d = e.length - 1,
      a = this.parts,
      [p, u] = Ne(e, t);
    if (
      ((this.el = F.createElement(p, o)),
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
            if (c.endsWith($e)) {
              const b = u[n++],
                $ = i.getAttribute(c).split(A),
                M = /([.?@])?(.*)/.exec(b);
              (a.push({
                type: 1,
                index: r,
                name: M[2],
                strings: $,
                ctor:
                  M[1] === "." ? Be : M[1] === "?" ? Le : M[1] === "@" ? Ze : X,
              }),
                i.removeAttribute(c));
            } else
              c.startsWith(A) &&
                (a.push({ type: 6, index: r }), i.removeAttribute(c));
        if (we.test(i.tagName)) {
          const c = i.textContent.split(A),
            b = c.length - 1;
          if (b > 0) {
            i.textContent = G ? G.emptyScript : "";
            for (let $ = 0; $ < b; $++)
              (i.append(c[$], W()),
                P.nextNode(),
                a.push({ type: 2, index: ++r }));
            i.append(c[b], W());
          }
        }
      } else if (i.nodeType === 8)
        if (i.data === xe) a.push({ type: 2, index: r });
        else {
          let c = -1;
          for (; (c = i.data.indexOf(A, c + 1)) !== -1; )
            (a.push({ type: 7, index: r }), (c += A.length - 1));
        }
      r++;
    }
  }
  static createElement(e, t) {
    const o = D.createElement("template");
    return ((o.innerHTML = e), o);
  }
}
function H(s, e, t = s, o) {
  var n, d;
  if (e === N) return e;
  let i = o !== void 0 ? ((n = t._$Co) == null ? void 0 : n[o]) : t._$Cl;
  const r = V(e) ? void 0 : e._$litDirective$;
  return (
    (i == null ? void 0 : i.constructor) !== r &&
      ((d = i == null ? void 0 : i._$AO) == null || d.call(i, !1),
      r === void 0 ? (i = void 0) : ((i = new r(s)), i._$AT(s, t, o)),
      o !== void 0 ? ((t._$Co ?? (t._$Co = []))[o] = i) : (t._$Cl = i)),
    i !== void 0 && (e = H(s, i._$AS(s, e.values), i, o)),
    e
  );
}
class He {
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
      i = ((e == null ? void 0 : e.creationScope) ?? D).importNode(t, !0);
    P.currentNode = i;
    let r = P.nextNode(),
      n = 0,
      d = 0,
      a = o[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let p;
        (a.type === 2
          ? (p = new J(r, r.nextSibling, this, e))
          : a.type === 1
            ? (p = new a.ctor(r, a.name, a.strings, this, e))
            : a.type === 6 && (p = new Re(r, this, e)),
          this._$AV.push(p),
          (a = o[++d]));
      }
      n !== (a == null ? void 0 : a.index) && ((r = P.nextNode()), n++);
    }
    return ((P.currentNode = D), i);
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
class J {
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
      V(e)
        ? e === _ || e == null || e === ""
          ? (this._$AH !== _ && this._$AR(), (this._$AH = _))
          : e !== this._$AH && e !== N && this._(e)
        : e._$litType$ !== void 0
          ? this.$(e)
          : e.nodeType !== void 0
            ? this.T(e)
            : Me(e)
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
    (this._$AH !== _ && V(this._$AH)
      ? (this._$AA.nextSibling.data = e)
      : this.T(D.createTextNode(e)),
      (this._$AH = e));
  }
  $(e) {
    var r;
    const { values: t, _$litType$: o } = e,
      i =
        typeof o == "number"
          ? this._$AC(e)
          : (o.el === void 0 &&
              (o.el = F.createElement(Se(o.h, o.h[0]), this.options)),
            o);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === i) this._$AH.p(t);
    else {
      const n = new He(i, this),
        d = n.u(this.options);
      (n.p(t), this.T(d), (this._$AH = n));
    }
  }
  _$AC(e) {
    let t = fe.get(e.strings);
    return (t === void 0 && fe.set(e.strings, (t = new F(e))), t);
  }
  k(e) {
    le(this._$AH) || ((this._$AH = []), this._$AR());
    const t = this._$AH;
    let o,
      i = 0;
    for (const r of e)
      (i === t.length
        ? t.push((o = new J(this.O(W()), this.O(W()), this, this.options)))
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
class X {
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
        (n = !V(e) || (e !== this._$AH && e !== N)),
        n && (this._$AH = e));
    else {
      const d = e;
      let a, p;
      for (e = r[0], a = 0; a < r.length - 1; a++)
        ((p = H(this, d[o + a], t, a)),
          p === N && (p = this._$AH[a]),
          n || (n = !V(p) || p !== this._$AH[a]),
          p === _ ? (e = _) : e !== _ && (e += (p ?? "") + r[a + 1]),
          (this._$AH[a] = p));
    }
    n && !i && this.j(e);
  }
  j(e) {
    e === _
      ? this.element.removeAttribute(this.name)
      : this.element.setAttribute(this.name, e ?? "");
  }
}
class Be extends X {
  constructor() {
    (super(...arguments), (this.type = 3));
  }
  j(e) {
    this.element[this.name] = e === _ ? void 0 : e;
  }
}
class Le extends X {
  constructor() {
    (super(...arguments), (this.type = 4));
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== _);
  }
}
class Ze extends X {
  constructor(e, t, o, i, r) {
    (super(e, t, o, i, r), (this.type = 5));
  }
  _$AI(e, t = this) {
    if ((e = H(this, e, t, 0) ?? _) === N) return;
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
class Re {
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
const se = q.litHtmlPolyfillSupport;
(se == null || se(F, J),
  (q.litHtmlVersions ?? (q.litHtmlVersions = [])).push("3.3.1"));
const qe = (s, e, t) => {
  const o = (t == null ? void 0 : t.renderBefore) ?? e;
  let i = o._$litPart$;
  if (i === void 0) {
    const r = (t == null ? void 0 : t.renderBefore) ?? null;
    o._$litPart$ = i = new J(e.insertBefore(W(), r), r, void 0, t ?? {});
  }
  return (i._$AI(s), i);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis;
class y extends j {
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
      (this._$Do = qe(t, this.renderRoot, this.renderOptions)));
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
    return N;
  }
}
var be;
((y._$litElement$ = !0),
  (y.finalized = !0),
  (be = O.litElementHydrateSupport) == null || be.call(O, { LitElement: y }));
const oe = O.litElementPolyfillSupport;
oe == null || oe({ LitElement: y });
(O.litElementVersions ?? (O.litElementVersions = [])).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const I = (s) => (e, t) => {
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
const We = {
    attribute: !0,
    type: String,
    converter: Y,
    reflect: !1,
    hasChanged: ae,
  },
  Ve = (s = We, e, t) => {
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
      ? Ve(s, e, t)
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
function h(s) {
  return m({ ...s, state: !0, attribute: !1 });
}
var Fe = Object.defineProperty,
  Je = Object.getOwnPropertyDescriptor,
  x = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? Je(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && Fe(e, t, i), i);
  };
let f = class extends y {
  constructor() {
    (super(...arguments),
      (this.open = !1),
      (this.entities = []),
      (this.preselected = null),
      (this._name = ""),
      (this._temperatureSensor = ""),
      (this._heaters = /* @__PURE__ */ new Set()),
      (this._coolers = /* @__PURE__ */ new Set()),
      (this._windowSensors = /* @__PURE__ */ new Set()));
  }
  updated(s) {
    if (s.has("open") && this.open && this.preselected) {
      const e = this.entities.find((t) => t.entity_id === this.preselected);
      e &&
        ((this._name = e.area_name || e.name || e.entity_id.split(".")[1]),
        this._heaters.clear(),
        this._coolers.clear(),
        this._windowSensors.clear(),
        e.domain === "climate"
          ? (this._heaters.add(e.entity_id),
            (this._temperatureSensor = e.entity_id))
          : e.domain === "switch" && this._heaters.add(e.entity_id),
        this.requestUpdate());
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
f.styles = z`
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
x([m({ attribute: !1 })], f.prototype, "hass", 2);
x([m({ type: Boolean, reflect: !0 })], f.prototype, "open", 2);
x([m({ attribute: !1 })], f.prototype, "entities", 2);
x([m({ attribute: !1 })], f.prototype, "preselected", 2);
x([h()], f.prototype, "_name", 2);
x([h()], f.prototype, "_temperatureSensor", 2);
x([h()], f.prototype, "_heaters", 2);
x([h()], f.prototype, "_coolers", 2);
x([h()], f.prototype, "_windowSensors", 2);
f = x([I("adopt-dialog")], f);
var Ke = Object.defineProperty,
  Ye = Object.getOwnPropertyDescriptor,
  L = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? Ye(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && Ke(e, t, i), i);
  };
let E = class extends y {
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
E.styles = z`
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
L([m({ attribute: !1 })], E.prototype, "hass", 2);
L([h()], E.prototype, "_devices", 2);
L([h()], E.prototype, "_loading", 2);
L([h()], E.prototype, "_dialogOpen", 2);
L([h()], E.prototype, "_selectedEntity", 2);
E = L([I("setup-view")], E);
var Ge = Object.defineProperty,
  Qe = Object.getOwnPropertyDescriptor,
  ee = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? Qe(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && Ge(e, t, i), i);
  };
let B = class extends y {
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
          ${this._renderBlocks(s.attributes.schedule || [], e)}
        </div>
      </div>
    `;
  }
  _renderBlocks(s, e) {
    const t = s.filter((o) => o.days.includes(e));
    return (
      t.sort((o, i) => o.start_time.localeCompare(i.start_time)),
      t.map((o, i) => {
        const [r, n] = o.start_time.split(":").map(Number),
          d = r * 60 + n;
        let a = 1440;
        if (i < t.length - 1) {
          const b = t[i + 1],
            [$, M] = b.start_time.split(":").map(Number);
          a = $ * 60 + M;
        }
        const p = a - d,
          u = (d / 1440) * 100,
          c = (p / 1440) * 100;
        return l`
        <div
          class="schedule-block mode-${o.hvac_mode}"
          style="left: ${u}%; width: ${c}%;"
          title="${o.name}: ${o.start_time} (${o.target_temp}°C)"
        >
          ${o.target_temp}°
        </div>
      `;
      })
    );
  }
  _renderCurrentTimeLine() {
    const s = /* @__PURE__ */ new Date(),
      t = ((s.getHours() * 60 + s.getMinutes()) / 1440) * 100;
    return l`
      <div
        class="current-time-line"
        style="left: calc(120px + (100% - 120px) * ${t / 100})"
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
B.styles = z`
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
    .time-axis {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-left: 120px; /* Space for labels */
      font-size: 0.8em;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
    }
    .time-marker {
      position: relative;
      width: 0;
      display: flex;
      justify-content: center;
    }
    .time-marker::after {
      content: "";
      position: absolute;
      top: 100%;
      height: 4px;
      width: 1px;
      background: var(--divider-color);
    }
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
    .timeline-track {
      flex: 1;
      position: relative;
      height: 32px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      overflow: hidden;
    }
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
      background-color: var(--green-color, #4caf50);
    }
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
      left: -3px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--primary-color, #03a9f4);
    }
  `;
ee([m({ attribute: !1 })], B.prototype, "hass", 2);
ee([m()], B.prototype, "focusZoneId", 2);
ee([h()], B.prototype, "_selectedDay", 2);
B = ee([I("timeline-view")], B);
var Xe = Object.defineProperty,
  et = Object.getOwnPropertyDescriptor,
  Ae = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? et(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && Xe(e, t, i), i);
  };
let Q = class extends y {
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
            class="mode-btn ${s.state === "heat" ? "active" : ""}"
            @click=${(r) => this._setMode(r, s.entity_id, "heat")}
          >
            Heat
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
Q.styles = z`
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
Ae([m({ attribute: !1 })], Q.prototype, "hass", 2);
Q = Ae([I("zones-view")], Q);
var tt = Object.defineProperty,
  it = Object.getOwnPropertyDescriptor,
  v = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? it(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && tt(e, t, i), i);
  };
let g = class extends y {
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
g.styles = z`
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
v([m({ attribute: !1 })], g.prototype, "hass", 2);
v([m({ attribute: !1 })], g.prototype, "zoneId", 2);
v([m({ attribute: !1 })], g.prototype, "allEntities", 2);
v([h()], g.prototype, "_uniqueId", 2);
v([h()], g.prototype, "_name", 2);
v([h()], g.prototype, "_temperatureSensor", 2);
v([h()], g.prototype, "_heaters", 2);
v([h()], g.prototype, "_coolers", 2);
v([h()], g.prototype, "_windowSensors", 2);
v([h()], g.prototype, "_restoreDelayMinutes", 2);
v([h()], g.prototype, "_loading", 2);
v([h()], g.prototype, "_error", 2);
g = v([I("zone-editor")], g);
var st = Object.defineProperty,
  ot = Object.getOwnPropertyDescriptor,
  U = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? ot(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && st(e, t, i), i);
  };
const rt = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
let w = class extends y {
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
        e &&
          e.attributes.schedule &&
          ((this._schedule = JSON.parse(JSON.stringify(e.attributes.schedule))),
          (this._config = {
            name: e.attributes.friendly_name,
            temperature_sensor: e.attributes.temperature_sensor,
            heaters: e.attributes.heaters || [],
            coolers: e.attributes.coolers || [],
            window_sensors: e.attributes.window_sensors || [],
          }));
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
        target_temp: 20,
        days: ["mon", "tue", "wed", "thu", "fri"],
        hvac_mode: "heat",
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
                    <label>Target Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      .value=${s.target_temp}
                      @input=${(t) =>
                        this._updateBlock(
                          e,
                          "target_temp",
                          parseFloat(t.target.value),
                        )}
                    />
                  </div>
                  <div class="field">
                    <label>Mode</label>
                    <select
                      .value=${s.hvac_mode}
                      @change=${(t) => this._updateBlock(e, "hvac_mode", t.target.value)}
                    >
                      <option value="heat">Heat</option>
                      <option value="cool">Cool</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                </div>

                <div class="row">
                  <div class="field" style="flex: 2;">
                    <label>Days</label>
                    <div class="days-selector">
                      ${rt.map(
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
w.styles = z`
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
    }
    .day-btn {
      padding: 4px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8em;
      background: transparent;
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
U([m({ attribute: !1 })], w.prototype, "hass", 2);
U([m({ attribute: !1 })], w.prototype, "zoneId", 2);
U([h()], w.prototype, "_schedule", 2);
U([h()], w.prototype, "_loading", 2);
U([h()], w.prototype, "_uniqueId", 2);
U([h()], w.prototype, "_config", 2);
w = U([I("schedule-editor")], w);
var nt = Object.defineProperty,
  at = Object.getOwnPropertyDescriptor,
  T = (s, e, t, o) => {
    for (
      var i = o > 1 ? void 0 : o ? at(e, t) : e, r = s.length - 1, n;
      r >= 0;
      r--
    )
      (n = s[r]) && (i = (o ? n(e, t, i) : n(i)) || i);
    return (o && i && nt(e, t, i), i);
  };
let S = class extends y {
  constructor() {
    (super(...arguments),
      (this._view = "zones"),
      (this._editingZoneId = null),
      (this._unmanagedCount = 0));
  }
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
                    ? (this._view = "timeline")
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
            class="icon-btn"
            @click=${() => (this._view = "timeline")}
            ?hidden=${this._view === "timeline" || this._view === "editor" || this._view === "schedule"}
          >
            <ha-icon icon="mdi:chart-timeline"></ha-icon>
          </button>

          <!-- Setup Toggle (Badge) -->
          <button
            class="icon-btn"
            @click=${() => (this._view = "setup")}
            ?hidden=${this._view === "editor" || this._view === "schedule"}
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
S.styles = z`
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
T([m({ attribute: !1 })], S.prototype, "hass", 2);
T([m({ attribute: !1 })], S.prototype, "narrow", 2);
T([m({ attribute: !1 })], S.prototype, "panel", 2);
T([h()], S.prototype, "_view", 2);
T([h()], S.prototype, "_editingZoneId", 2);
T([h()], S.prototype, "_unmanagedCount", 2);
S = T([I("climate-dashboard")], S);
console.info(
  "%c CLIMATE-DASHBOARD %c 0.0.1 ",
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;",
);
