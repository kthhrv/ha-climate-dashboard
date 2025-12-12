/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const k = globalThis,
  J =
    k.ShadowRoot &&
    (k.ShadyCSS === void 0 || k.ShadyCSS.nativeShadow) &&
    "adoptedStyleSheets" in Document.prototype &&
    "replace" in CSSStyleSheet.prototype,
  K = Symbol(),
  et = /* @__PURE__ */ new WeakMap();
let pt = class {
  constructor(t, e, s) {
    if (((this._$cssResult$ = !0), s !== K))
      throw Error(
        "CSSResult is not constructable. Use `unsafeCSS` or `css` instead.",
      );
    ((this.cssText = t), (this.t = e));
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (J && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      (s && (t = et.get(e)),
        t === void 0 &&
          ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText),
          s && et.set(e, t)));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const mt = (r) => new pt(typeof r == "string" ? r : r + "", void 0, K),
  G = (r, ...t) => {
    const e =
      r.length === 1
        ? r[0]
        : t.reduce(
            (s, i, n) =>
              s +
              ((o) => {
                if (o._$cssResult$ === !0) return o.cssText;
                if (typeof o == "number") return o;
                throw Error(
                  "Value passed to 'css' function must be a 'css' function result: " +
                    o +
                    ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.",
                );
              })(i) +
              r[n + 1],
            r[0],
          );
    return new pt(e, r, K);
  },
  gt = (r, t) => {
    if (J)
      r.adoptedStyleSheets = t.map((e) =>
        e instanceof CSSStyleSheet ? e : e.styleSheet,
      );
    else
      for (const e of t) {
        const s = document.createElement("style"),
          i = k.litNonce;
        (i !== void 0 && s.setAttribute("nonce", i),
          (s.textContent = e.cssText),
          r.appendChild(s));
      }
  },
  st = J
    ? (r) => r
    : (r) =>
        r instanceof CSSStyleSheet
          ? ((t) => {
              let e = "";
              for (const s of t.cssRules) e += s.cssText;
              return mt(e);
            })(r)
          : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const {
    is: yt,
    defineProperty: bt,
    getOwnPropertyDescriptor: At,
    getOwnPropertyNames: wt,
    getOwnPropertySymbols: xt,
    getPrototypeOf: Et,
  } = Object,
  v = globalThis,
  it = v.trustedTypes,
  St = it ? it.emptyScript : "",
  V = v.reactiveElementPolyfillSupport,
  U = (r, t) => r,
  z = {
    toAttribute(r, t) {
      switch (t) {
        case Boolean:
          r = r ? St : null;
          break;
        case Object:
        case Array:
          r = r == null ? r : JSON.stringify(r);
      }
      return r;
    },
    fromAttribute(r, t) {
      let e = r;
      switch (t) {
        case Boolean:
          e = r !== null;
          break;
        case Number:
          e = r === null ? null : Number(r);
          break;
        case Object:
        case Array:
          try {
            e = JSON.parse(r);
          } catch {
            e = null;
          }
      }
      return e;
    },
  },
  Q = (r, t) => !yt(r, t),
  rt = {
    attribute: !0,
    type: String,
    converter: z,
    reflect: !1,
    useDefault: !1,
    hasChanged: Q,
  };
(Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")),
  v.litPropertyMetadata ??
    (v.litPropertyMetadata = /* @__PURE__ */ new WeakMap()));
let x = class extends HTMLElement {
  static addInitializer(t) {
    (this._$Ei(), (this.l ?? (this.l = [])).push(t));
  }
  static get observedAttributes() {
    return (this.finalize(), this._$Eh && [...this._$Eh.keys()]);
  }
  static createProperty(t, e = rt) {
    if (
      (e.state && (e.attribute = !1),
      this._$Ei(),
      this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0),
      this.elementProperties.set(t, e),
      !e.noAccessor)
    ) {
      const s = Symbol(),
        i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && bt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: n } = At(this.prototype, t) ?? {
      get() {
        return this[e];
      },
      set(o) {
        this[e] = o;
      },
    };
    return {
      get: i,
      set(o) {
        const h = i == null ? void 0 : i.call(this);
        (n == null || n.call(this, o), this.requestUpdate(t, h, s));
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? rt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const t = Et(this);
    (t.finalize(),
      t.l !== void 0 && (this.l = [...t.l]),
      (this.elementProperties = new Map(t.elementProperties)));
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (
      ((this.finalized = !0), this._$Ei(), this.hasOwnProperty(U("properties")))
    ) {
      const e = this.properties,
        s = [...wt(e), ...xt(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0)
        for (const [s, i] of e) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const i = this._$Eu(e, s);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) e.unshift(st(i));
    } else t !== void 0 && e.push(st(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1
      ? void 0
      : typeof s == "string"
        ? s
        : typeof t == "string"
          ? t.toLowerCase()
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
    var t;
    ((this._$ES = new Promise((e) => (this.enableUpdating = e))),
      (this._$AL = /* @__PURE__ */ new Map()),
      this._$E_(),
      this.requestUpdate(),
      (t = this.constructor.l) == null || t.forEach((e) => e(this)));
  }
  addController(t) {
    var e;
    ((this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t),
      this.renderRoot !== void 0 &&
        this.isConnected &&
        ((e = t.hostConnected) == null || e.call(t)));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(),
      e = this.constructor.elementProperties;
    for (const s of e.keys())
      this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t =
      this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return (gt(t, this.constructor.elementStyles), t);
  }
  connectedCallback() {
    var t;
    (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()),
      this.enableUpdating(!0),
      (t = this._$EO) == null ||
        t.forEach((e) => {
          var s;
          return (s = e.hostConnected) == null ? void 0 : s.call(e);
        }));
  }
  enableUpdating(t) {}
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null ||
      t.forEach((e) => {
        var s;
        return (s = e.hostDisconnected) == null ? void 0 : s.call(e);
      });
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    var n;
    const s = this.constructor.elementProperties.get(t),
      i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const o = (
        ((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0
          ? s.converter
          : z
      ).toAttribute(e, s.type);
      ((this._$Em = t),
        o == null ? this.removeAttribute(i) : this.setAttribute(i, o),
        (this._$Em = null));
    }
  }
  _$AK(t, e) {
    var n, o;
    const s = this.constructor,
      i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const h = s.getPropertyOptions(i),
        a =
          typeof h.converter == "function"
            ? { fromAttribute: h.converter }
            : ((n = h.converter) == null ? void 0 : n.fromAttribute) !== void 0
              ? h.converter
              : z;
      this._$Em = i;
      const c = a.fromAttribute(e, h.type);
      ((this[i] = c ?? ((o = this._$Ej) == null ? void 0 : o.get(i)) ?? c),
        (this._$Em = null));
    }
  }
  requestUpdate(t, e, s) {
    var i;
    if (t !== void 0) {
      const n = this.constructor,
        o = this[t];
      if (
        (s ?? (s = n.getPropertyOptions(t)),
        !(
          (s.hasChanged ?? Q)(o, e) ||
          (s.useDefault &&
            s.reflect &&
            o === ((i = this._$Ej) == null ? void 0 : i.get(t)) &&
            !this.hasAttribute(n._$Eu(t, s)))
        ))
      )
        return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: n }, o) {
    (s &&
      !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) &&
      (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0)) ||
      (this._$AL.has(t) ||
        (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)),
      i === !0 &&
        this._$Em !== t &&
        (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return (t != null && (await t), !this.isUpdatePending);
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (
        (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()),
        this._$Ep)
      ) {
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0)
        for (const [n, o] of i) {
          const { wrapped: h } = o,
            a = this[n];
          h !== !0 ||
            this._$AL.has(n) ||
            a === void 0 ||
            this.C(n, void 0, o, a);
        }
    }
    let t = !1;
    const e = this._$AL;
    try {
      ((t = this.shouldUpdate(e)),
        t
          ? (this.willUpdate(e),
            (s = this._$EO) == null ||
              s.forEach((i) => {
                var n;
                return (n = i.hostUpdate) == null ? void 0 : n.call(i);
              }),
            this.update(e))
          : this._$EM());
    } catch (i) {
      throw ((t = !1), this._$EM(), i);
    }
    t && this._$AE(e);
  }
  willUpdate(t) {}
  _$AE(t) {
    var e;
    ((e = this._$EO) == null ||
      e.forEach((s) => {
        var i;
        return (i = s.hostUpdated) == null ? void 0 : i.call(s);
      }),
      this.hasUpdated || ((this.hasUpdated = !0), this.firstUpdated(t)),
      this.updated(t));
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    (this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))),
      this._$EM());
  }
  updated(t) {}
  firstUpdated(t) {}
};
((x.elementStyles = []),
  (x.shadowRootOptions = { mode: "open" }),
  (x[U("elementProperties")] = /* @__PURE__ */ new Map()),
  (x[U("finalized")] = /* @__PURE__ */ new Map()),
  V == null || V({ ReactiveElement: x }),
  (v.reactiveElementVersions ?? (v.reactiveElementVersions = [])).push(
    "2.1.1",
  ));
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const T = globalThis,
  I = T.trustedTypes,
  ot = I ? I.createPolicy("lit-html", { createHTML: (r) => r }) : void 0,
  ut = "$lit$",
  f = `lit$${Math.random().toFixed(9).slice(2)}$`,
  $t = "?" + f,
  Pt = `<${$t}>`,
  A = document,
  M = () => A.createComment(""),
  H = (r) => r === null || (typeof r != "object" && typeof r != "function"),
  X = Array.isArray,
  Ct = (r) =>
    X(r) || typeof (r == null ? void 0 : r[Symbol.iterator]) == "function",
  q = `[ 	
\f\r]`,
  O = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
  nt = /-->/g,
  at = />/g,
  m = RegExp(
    `>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,
    "g",
  ),
  ht = /'/g,
  lt = /"/g,
  _t = /^(?:script|style|textarea|title)$/i,
  Ot =
    (r) =>
    (t, ...e) => ({ _$litType$: r, strings: t, values: e }),
  u = Ot(1),
  E = Symbol.for("lit-noChange"),
  d = Symbol.for("lit-nothing"),
  ct = /* @__PURE__ */ new WeakMap(),
  g = A.createTreeWalker(A, 129);
function ft(r, t) {
  if (!X(r) || !r.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return ot !== void 0 ? ot.createHTML(t) : t;
}
const Ut = (r, t) => {
  const e = r.length - 1,
    s = [];
  let i,
    n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "",
    o = O;
  for (let h = 0; h < e; h++) {
    const a = r[h];
    let c,
      p,
      l = -1,
      $ = 0;
    for (; $ < a.length && ((o.lastIndex = $), (p = o.exec(a)), p !== null); )
      (($ = o.lastIndex),
        o === O
          ? p[1] === "!--"
            ? (o = nt)
            : p[1] !== void 0
              ? (o = at)
              : p[2] !== void 0
                ? (_t.test(p[2]) && (i = RegExp("</" + p[2], "g")), (o = m))
                : p[3] !== void 0 && (o = m)
          : o === m
            ? p[0] === ">"
              ? ((o = i ?? O), (l = -1))
              : p[1] === void 0
                ? (l = -2)
                : ((l = o.lastIndex - p[2].length),
                  (c = p[1]),
                  (o = p[3] === void 0 ? m : p[3] === '"' ? lt : ht))
            : o === lt || o === ht
              ? (o = m)
              : o === nt || o === at
                ? (o = O)
                : ((o = m), (i = void 0)));
    const _ = o === m && r[h + 1].startsWith("/>") ? " " : "";
    n +=
      o === O
        ? a + Pt
        : l >= 0
          ? (s.push(c), a.slice(0, l) + ut + a.slice(l) + f + _)
          : a + f + (l === -2 ? h : _);
  }
  return [
    ft(
      r,
      n + (r[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : ""),
    ),
    s,
  ];
};
class N {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let n = 0,
      o = 0;
    const h = t.length - 1,
      a = this.parts,
      [c, p] = Ut(t, e);
    if (
      ((this.el = N.createElement(c, s)),
      (g.currentNode = this.el.content),
      e === 2 || e === 3)
    ) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (i = g.nextNode()) !== null && a.length < h; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes())
          for (const l of i.getAttributeNames())
            if (l.endsWith(ut)) {
              const $ = p[o++],
                _ = i.getAttribute(l).split(f),
                j = /([.?@])?(.*)/.exec($);
              (a.push({
                type: 1,
                index: n,
                name: j[2],
                strings: _,
                ctor:
                  j[1] === "." ? Mt : j[1] === "?" ? Ht : j[1] === "@" ? Nt : B,
              }),
                i.removeAttribute(l));
            } else
              l.startsWith(f) &&
                (a.push({ type: 6, index: n }), i.removeAttribute(l));
        if (_t.test(i.tagName)) {
          const l = i.textContent.split(f),
            $ = l.length - 1;
          if ($ > 0) {
            i.textContent = I ? I.emptyScript : "";
            for (let _ = 0; _ < $; _++)
              (i.append(l[_], M()),
                g.nextNode(),
                a.push({ type: 2, index: ++n }));
            i.append(l[$], M());
          }
        }
      } else if (i.nodeType === 8)
        if (i.data === $t) a.push({ type: 2, index: n });
        else {
          let l = -1;
          for (; (l = i.data.indexOf(f, l + 1)) !== -1; )
            (a.push({ type: 7, index: n }), (l += f.length - 1));
        }
      n++;
    }
  }
  static createElement(t, e) {
    const s = A.createElement("template");
    return ((s.innerHTML = t), s);
  }
}
function S(r, t, e = r, s) {
  var o, h;
  if (t === E) return t;
  let i = s !== void 0 ? ((o = e._$Co) == null ? void 0 : o[s]) : e._$Cl;
  const n = H(t) ? void 0 : t._$litDirective$;
  return (
    (i == null ? void 0 : i.constructor) !== n &&
      ((h = i == null ? void 0 : i._$AO) == null || h.call(i, !1),
      n === void 0 ? (i = void 0) : ((i = new n(r)), i._$AT(r, e, s)),
      s !== void 0 ? ((e._$Co ?? (e._$Co = []))[s] = i) : (e._$Cl = i)),
    i !== void 0 && (t = S(r, i._$AS(r, t.values), i, s)),
    t
  );
}
class Tt {
  constructor(t, e) {
    ((this._$AV = []), (this._$AN = void 0), (this._$AD = t), (this._$AM = e));
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const {
        el: { content: e },
        parts: s,
      } = this._$AD,
      i = ((t == null ? void 0 : t.creationScope) ?? A).importNode(e, !0);
    g.currentNode = i;
    let n = g.nextNode(),
      o = 0,
      h = 0,
      a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let c;
        (a.type === 2
          ? (c = new R(n, n.nextSibling, this, t))
          : a.type === 1
            ? (c = new a.ctor(n, a.name, a.strings, this, t))
            : a.type === 6 && (c = new Rt(n, this, t)),
          this._$AV.push(c),
          (a = s[++h]));
      }
      o !== (a == null ? void 0 : a.index) && ((n = g.nextNode()), o++);
    }
    return ((g.currentNode = A), i);
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV)
      (s !== void 0 &&
        (s.strings !== void 0
          ? (s._$AI(t, s, e), (e += s.strings.length - 2))
          : s._$AI(t[e])),
        e++);
  }
}
class R {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    ((this.type = 2),
      (this._$AH = d),
      (this._$AN = void 0),
      (this._$AA = t),
      (this._$AB = e),
      (this._$AM = s),
      (this.options = i),
      (this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0));
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return (
      e !== void 0 &&
        (t == null ? void 0 : t.nodeType) === 11 &&
        (t = e.parentNode),
      t
    );
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    ((t = S(this, t, e)),
      H(t)
        ? t === d || t == null || t === ""
          ? (this._$AH !== d && this._$AR(), (this._$AH = d))
          : t !== this._$AH && t !== E && this._(t)
        : t._$litType$ !== void 0
          ? this.$(t)
          : t.nodeType !== void 0
            ? this.T(t)
            : Ct(t)
              ? this.k(t)
              : this._(t));
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), (this._$AH = this.O(t)));
  }
  _(t) {
    (this._$AH !== d && H(this._$AH)
      ? (this._$AA.nextSibling.data = t)
      : this.T(A.createTextNode(t)),
      (this._$AH = t));
  }
  $(t) {
    var n;
    const { values: e, _$litType$: s } = t,
      i =
        typeof s == "number"
          ? this._$AC(t)
          : (s.el === void 0 &&
              (s.el = N.createElement(ft(s.h, s.h[0]), this.options)),
            s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === i) this._$AH.p(e);
    else {
      const o = new Tt(i, this),
        h = o.u(this.options);
      (o.p(e), this.T(h), (this._$AH = o));
    }
  }
  _$AC(t) {
    let e = ct.get(t.strings);
    return (e === void 0 && ct.set(t.strings, (e = new N(t))), e);
  }
  k(t) {
    X(this._$AH) || ((this._$AH = []), this._$AR());
    const e = this._$AH;
    let s,
      i = 0;
    for (const n of t)
      (i === e.length
        ? e.push((s = new R(this.O(M()), this.O(M()), this, this.options)))
        : (s = e[i]),
        s._$AI(n),
        i++);
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), (e.length = i));
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var s;
    for (
      (s = this._$AP) == null ? void 0 : s.call(this, !1, !0, e);
      t !== this._$AB;
    ) {
      const i = t.nextSibling;
      (t.remove(), (t = i));
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 &&
      ((this._$Cv = t), (e = this._$AP) == null || e.call(this, t));
  }
}
class B {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, n) {
    ((this.type = 1),
      (this._$AH = d),
      (this._$AN = void 0),
      (this.element = t),
      (this.name = e),
      (this._$AM = i),
      (this.options = n),
      s.length > 2 || s[0] !== "" || s[1] !== ""
        ? ((this._$AH = Array(s.length - 1).fill(new String())),
          (this.strings = s))
        : (this._$AH = d));
  }
  _$AI(t, e = this, s, i) {
    const n = this.strings;
    let o = !1;
    if (n === void 0)
      ((t = S(this, t, e, 0)),
        (o = !H(t) || (t !== this._$AH && t !== E)),
        o && (this._$AH = t));
    else {
      const h = t;
      let a, c;
      for (t = n[0], a = 0; a < n.length - 1; a++)
        ((c = S(this, h[s + a], e, a)),
          c === E && (c = this._$AH[a]),
          o || (o = !H(c) || c !== this._$AH[a]),
          c === d ? (t = d) : t !== d && (t += (c ?? "") + n[a + 1]),
          (this._$AH[a] = c));
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === d
      ? this.element.removeAttribute(this.name)
      : this.element.setAttribute(this.name, t ?? "");
  }
}
class Mt extends B {
  constructor() {
    (super(...arguments), (this.type = 3));
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class Ht extends B {
  constructor() {
    (super(...arguments), (this.type = 4));
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class Nt extends B {
  constructor(t, e, s, i, n) {
    (super(t, e, s, i, n), (this.type = 5));
  }
  _$AI(t, e = this) {
    if ((t = S(this, t, e, 0) ?? d) === E) return;
    const s = this._$AH,
      i =
        (t === d && s !== d) ||
        t.capture !== s.capture ||
        t.once !== s.once ||
        t.passive !== s.passive,
      n = t !== d && (s === d || i);
    (i && this.element.removeEventListener(this.name, this, s),
      n && this.element.addEventListener(this.name, this, t),
      (this._$AH = t));
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function"
      ? this._$AH.call(
          ((e = this.options) == null ? void 0 : e.host) ?? this.element,
          t,
        )
      : this._$AH.handleEvent(t);
  }
}
class Rt {
  constructor(t, e, s) {
    ((this.element = t),
      (this.type = 6),
      (this._$AN = void 0),
      (this._$AM = e),
      (this.options = s));
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    S(this, t);
  }
}
const Z = T.litHtmlPolyfillSupport;
(Z == null || Z(N, R),
  (T.litHtmlVersions ?? (T.litHtmlVersions = [])).push("3.3.1"));
const Dt = (r, t, e) => {
  const s = (e == null ? void 0 : e.renderBefore) ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const n = (e == null ? void 0 : e.renderBefore) ?? null;
    s._$litPart$ = i = new R(t.insertBefore(M(), n), n, void 0, e ?? {});
  }
  return (i._$AI(r), i);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const y = globalThis;
class b extends x {
  constructor() {
    (super(...arguments),
      (this.renderOptions = { host: this }),
      (this._$Do = void 0));
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (
      (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild),
      t
    );
  }
  update(t) {
    const e = this.render();
    (this.hasUpdated || (this.renderOptions.isConnected = this.isConnected),
      super.update(t),
      (this._$Do = Dt(e, this.renderRoot, this.renderOptions)));
  }
  connectedCallback() {
    var t;
    (super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0));
  }
  disconnectedCallback() {
    var t;
    (super.disconnectedCallback(),
      (t = this._$Do) == null || t.setConnected(!1));
  }
  render() {
    return E;
  }
}
var dt;
((b._$litElement$ = !0),
  (b.finalized = !0),
  (dt = y.litElementHydrateSupport) == null || dt.call(y, { LitElement: b }));
const F = y.litElementPolyfillSupport;
F == null || F({ LitElement: b });
(y.litElementVersions ?? (y.litElementVersions = [])).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Y = (r) => (t, e) => {
  e !== void 0
    ? e.addInitializer(() => {
        customElements.define(r, t);
      })
    : customElements.define(r, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const jt = {
    attribute: !0,
    type: String,
    converter: z,
    reflect: !1,
    hasChanged: Q,
  },
  kt = (r = jt, t, e) => {
    const { kind: s, metadata: i } = e;
    let n = globalThis.litPropertyMetadata.get(i);
    if (
      (n === void 0 &&
        globalThis.litPropertyMetadata.set(i, (n = /* @__PURE__ */ new Map())),
      s === "setter" && ((r = Object.create(r)).wrapped = !0),
      n.set(e.name, r),
      s === "accessor")
    ) {
      const { name: o } = e;
      return {
        set(h) {
          const a = t.get.call(this);
          (t.set.call(this, h), this.requestUpdate(o, a, r));
        },
        init(h) {
          return (h !== void 0 && this.C(o, void 0, r, h), h);
        },
      };
    }
    if (s === "setter") {
      const { name: o } = e;
      return function (h) {
        const a = this[o];
        (t.call(this, h), this.requestUpdate(o, a, r));
      };
    }
    throw Error("Unsupported decorator location: " + s);
  };
function C(r) {
  return (t, e) =>
    typeof e == "object"
      ? kt(r, t, e)
      : ((s, i, n) => {
          const o = i.hasOwnProperty(n);
          return (
            i.constructor.createProperty(n, s),
            o ? Object.getOwnPropertyDescriptor(i, n) : void 0
          );
        })(r, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function tt(r) {
  return C({ ...r, state: !0, attribute: !1 });
}
var zt = Object.defineProperty,
  It = Object.getOwnPropertyDescriptor,
  W = (r, t, e, s) => {
    for (
      var i = s > 1 ? void 0 : s ? It(t, e) : t, n = r.length - 1, o;
      n >= 0;
      n--
    )
      (o = r[n]) && (i = (s ? o(t, e, i) : o(i)) || i);
    return (s && i && zt(t, e, i), i);
  };
let P = class extends b {
  constructor() {
    (super(...arguments), (this._devices = []), (this._loading = !1));
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
      } catch (r) {
        console.error("Failed to fetch devices", r);
      } finally {
        this._loading = !1;
      }
    }
  }
  render() {
    return u`
      <div class="card">
        <h2>Inbox</h2>
        ${this._loading ? u`<p>Scanning...</p>` : this._renderList()}
      </div>
    `;
  }
  _renderList() {
    return this._devices.length === 0
      ? u`<div class="empty">
        No unmanaged devices found. Inbox Zero!
      </div>`
      : u`
      <div class="list">
        ${this._devices.map(
          (r) => u`
            <div class="item">
              <div class="item-info">
                <span class="icon">
                  <ha-icon icon="mdi:thermostat"></ha-icon>
                </span>
                <div>
                  <div>${r.name || r.entity_id}</div>
                  <div
                    style="font-size: 0.8em; color: var(--secondary-text-color)"
                  >
                    ${r.entity_id} • ${r.state}
                  </div>
                </div>
              </div>
              <mwc-button @click=${() => this._adoptEntity(r.entity_id)}
                >ADOPT</mwc-button
              >
            </div>
          `,
        )}
      </div>
    `;
  }
  async _adoptEntity(r) {
    try {
      (await this.hass.callWS({
        type: "climate_dashboard/adopt",
        actuator_id: r,
      }),
        this._fetchDevices());
    } catch (t) {
      (console.error("Failed to adopt", t),
        alert("Failed to adopt entity: " + t.message));
    }
  }
};
P.styles = G`
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
  `;
W([C({ attribute: !1 })], P.prototype, "hass", 2);
W([tt()], P.prototype, "_devices", 2);
W([tt()], P.prototype, "_loading", 2);
P = W([Y("inbox-view")], P);
var Lt = Object.defineProperty,
  Bt = Object.getOwnPropertyDescriptor,
  vt = (r, t, e, s) => {
    for (
      var i = s > 1 ? void 0 : s ? Bt(t, e) : t, n = r.length - 1, o;
      n >= 0;
      n--
    )
      (o = r[n]) && (i = (s ? o(t, e, i) : o(i)) || i);
    return (s && i && Lt(t, e, i), i);
  };
let L = class extends b {
  render() {
    if (!this.hass) return u``;
    const r = Object.values(this.hass.states).filter((t) =>
      t.entity_id.startsWith("climate.zone_"),
    );
    return u`
      <div class="card">
        <h2>Timeline (Managed Zones)</h2>
        ${r.length === 0 ? u`<p>No zones adopted yet.</p>` : r.map((t) => this._renderZone(t))}
      </div>
    `;
  }
  _renderZone(r) {
    const t = r.attributes.schedule || [];
    return u`
      <div class="zone-item">
        <div class="zone-header">
           <span>${r.attributes.friendly_name || r.entity_id}</span>
           <span>${r.state} (${r.attributes.temperature}°C)</span>
        </div>
        <div class="schedule-list">
          ${
            t.length === 0
              ? u`No schedule set`
              : t.map(
                  (e) => u`
              <span class="block">
                ${e.name}: ${e.start_time} -> ${e.target_temp}°C
              </span>
            `,
                )
          }
        </div>
      </div>
    `;
  }
};
L.styles = G`
    :host {
      display: block;
      padding: 16px;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h2 { margin-top: 0; }
    .zone-item {
      border-bottom: 1px solid var(--divider-color, #eee);
      padding: 12px 0;
    }
    .zone-header {
      font-weight: bold;
      display: flex;
      justify-content: space-between;
    }
    .schedule-list {
      margin-top: 8px;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }
    .block {
      display: inline-block;
      background: var(--secondary-background-color, #f5f5f5);
      padding: 4px 8px;
      border-radius: 4px;
      margin-right: 4px;
      margin-bottom: 4px;
    }
  `;
vt([C({ attribute: !1 })], L.prototype, "hass", 2);
L = vt([Y("timeline-view")], L);
var Wt = Object.defineProperty,
  Vt = Object.getOwnPropertyDescriptor,
  D = (r, t, e, s) => {
    for (
      var i = s > 1 ? void 0 : s ? Vt(t, e) : t, n = r.length - 1, o;
      n >= 0;
      n--
    )
      (o = r[n]) && (i = (s ? o(t, e, i) : o(i)) || i);
    return (s && i && Wt(t, e, i), i);
  };
let w = class extends b {
  constructor() {
    (super(...arguments), (this._view = "inbox"));
  }
  render() {
    return u`
      <div class="nav">
        <div
          class="nav-item ${this._view === "inbox" ? "active" : ""}"
          @click=${() => (this._view = "inbox")}
        >
          Inbox
        </div>
        <div
          class="nav-item ${this._view === "timeline" ? "active" : ""}"
          @click=${() => (this._view = "timeline")}
        >
          Timeline
        </div>
      </div>

      <div class="content">
        ${this._view === "inbox" ? u`<inbox-view .hass=${this.hass}></inbox-view>` : u`<timeline-view .hass=${this.hass}></timeline-view>`}
      </div>
    `;
  }
};
w.styles = G`
    :host {
      display: block;
      background-color: var(--primary-background-color);
      min-height: 100vh;
    }
    .nav {
      background: var(--app-header-background-color, #03a9f4);
      color: var(--app-header-text-color, white);
      padding: 16px;
      display: flex;
      gap: 16px;
    }
    .nav-item {
      cursor: pointer;
      opacity: 0.7;
      font-weight: 500;
    }
    .nav-item.active {
      opacity: 1;
      border-bottom: 2px solid white;
    }
  `;
D([C({ attribute: !1 })], w.prototype, "hass", 2);
D([C({ attribute: !1 })], w.prototype, "narrow", 2);
D([C({ attribute: !1 })], w.prototype, "panel", 2);
D([tt()], w.prototype, "_view", 2);
w = D([Y("climate-dashboard")], w);
console.info(
  "%c CLIMATE-DASHBOARD %c 0.0.1 ",
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;",
);
