/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const V = globalThis,
  it =
    V.ShadowRoot &&
    (V.ShadyCSS === void 0 || V.ShadyCSS.nativeShadow) &&
    "adoptedStyleSheets" in Document.prototype &&
    "replace" in CSSStyleSheet.prototype,
  st = Symbol(),
  nt = /* @__PURE__ */ new WeakMap();
let ft = class {
  constructor(t, i, s) {
    if (((this._$cssResult$ = !0), s !== st))
      throw Error(
        "CSSResult is not constructable. Use `unsafeCSS` or `css` instead.",
      );
    ((this.cssText = t), (this.t = i));
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (it && t === void 0) {
      const s = i !== void 0 && i.length === 1;
      (s && (t = nt.get(i)),
        t === void 0 &&
          ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText),
          s && nt.set(i, t)));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const At = (r) => new ft(typeof r == "string" ? r : r + "", void 0, st),
  H = (r, ...t) => {
    const i =
      r.length === 1
        ? r[0]
        : t.reduce(
            (s, e, o) =>
              s +
              ((n) => {
                if (n._$cssResult$ === !0) return n.cssText;
                if (typeof n == "number") return n;
                throw Error(
                  "Value passed to 'css' function must be a 'css' function result: " +
                    n +
                    ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.",
                );
              })(e) +
              r[o + 1],
            r[0],
          );
    return new ft(i, r, st);
  },
  St = (r, t) => {
    if (it)
      r.adoptedStyleSheets = t.map((i) =>
        i instanceof CSSStyleSheet ? i : i.styleSheet,
      );
    else
      for (const i of t) {
        const s = document.createElement("style"),
          e = V.litNonce;
        (e !== void 0 && s.setAttribute("nonce", e),
          (s.textContent = i.cssText),
          r.appendChild(s));
      }
  },
  at = it
    ? (r) => r
    : (r) =>
        r instanceof CSSStyleSheet
          ? ((t) => {
              let i = "";
              for (const s of t.cssRules) i += s.cssText;
              return At(i);
            })(r)
          : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const {
    is: Et,
    defineProperty: Ct,
    getOwnPropertyDescriptor: Pt,
    getOwnPropertyNames: kt,
    getOwnPropertySymbols: Ot,
    getPrototypeOf: Ut,
  } = Object,
  S = globalThis,
  lt = S.trustedTypes,
  zt = lt ? lt.emptyScript : "",
  X = S.reactiveElementPolyfillSupport,
  I = (r, t) => r,
  F = {
    toAttribute(r, t) {
      switch (t) {
        case Boolean:
          r = r ? zt : null;
          break;
        case Object:
        case Array:
          r = r == null ? r : JSON.stringify(r);
      }
      return r;
    },
    fromAttribute(r, t) {
      let i = r;
      switch (t) {
        case Boolean:
          i = r !== null;
          break;
        case Number:
          i = r === null ? null : Number(r);
          break;
        case Object:
        case Array:
          try {
            i = JSON.parse(r);
          } catch {
            i = null;
          }
      }
      return i;
    },
  },
  rt = (r, t) => !Et(r, t),
  dt = {
    attribute: !0,
    type: String,
    converter: F,
    reflect: !1,
    useDefault: !1,
    hasChanged: rt,
  };
(Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")),
  S.litPropertyMetadata ??
    (S.litPropertyMetadata = /* @__PURE__ */ new WeakMap()));
let z = class extends HTMLElement {
  static addInitializer(t) {
    (this._$Ei(), (this.l ?? (this.l = [])).push(t));
  }
  static get observedAttributes() {
    return (this.finalize(), this._$Eh && [...this._$Eh.keys()]);
  }
  static createProperty(t, i = dt) {
    if (
      (i.state && (i.attribute = !1),
      this._$Ei(),
      this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0),
      this.elementProperties.set(t, i),
      !i.noAccessor)
    ) {
      const s = Symbol(),
        e = this.getPropertyDescriptor(t, s, i);
      e !== void 0 && Ct(this.prototype, t, e);
    }
  }
  static getPropertyDescriptor(t, i, s) {
    const { get: e, set: o } = Pt(this.prototype, t) ?? {
      get() {
        return this[i];
      },
      set(n) {
        this[i] = n;
      },
    };
    return {
      get: e,
      set(n) {
        const d = e == null ? void 0 : e.call(this);
        (o == null || o.call(this, n), this.requestUpdate(t, d, s));
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? dt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(I("elementProperties"))) return;
    const t = Ut(this);
    (t.finalize(),
      t.l !== void 0 && (this.l = [...t.l]),
      (this.elementProperties = new Map(t.elementProperties)));
  }
  static finalize() {
    if (this.hasOwnProperty(I("finalized"))) return;
    if (
      ((this.finalized = !0), this._$Ei(), this.hasOwnProperty(I("properties")))
    ) {
      const i = this.properties,
        s = [...kt(i), ...Ot(i)];
      for (const e of s) this.createProperty(e, i[e]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0)
        for (const [s, e] of i) this.elementProperties.set(s, e);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const e = this._$Eu(i, s);
      e !== void 0 && this._$Eh.set(e, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const e of s) i.unshift(at(e));
    } else t !== void 0 && i.push(at(t));
    return i;
  }
  static _$Eu(t, i) {
    const s = i.attribute;
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
    ((this._$ES = new Promise((i) => (this.enableUpdating = i))),
      (this._$AL = /* @__PURE__ */ new Map()),
      this._$E_(),
      this.requestUpdate(),
      (t = this.constructor.l) == null || t.forEach((i) => i(this)));
  }
  addController(t) {
    var i;
    ((this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t),
      this.renderRoot !== void 0 &&
        this.isConnected &&
        ((i = t.hostConnected) == null || i.call(t)));
  }
  removeController(t) {
    var i;
    (i = this._$EO) == null || i.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(),
      i = this.constructor.elementProperties;
    for (const s of i.keys())
      this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t =
      this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return (St(t, this.constructor.elementStyles), t);
  }
  connectedCallback() {
    var t;
    (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()),
      this.enableUpdating(!0),
      (t = this._$EO) == null ||
        t.forEach((i) => {
          var s;
          return (s = i.hostConnected) == null ? void 0 : s.call(i);
        }));
  }
  enableUpdating(t) {}
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null ||
      t.forEach((i) => {
        var s;
        return (s = i.hostDisconnected) == null ? void 0 : s.call(i);
      });
  }
  attributeChangedCallback(t, i, s) {
    this._$AK(t, s);
  }
  _$ET(t, i) {
    var o;
    const s = this.constructor.elementProperties.get(t),
      e = this.constructor._$Eu(t, s);
    if (e !== void 0 && s.reflect === !0) {
      const n = (
        ((o = s.converter) == null ? void 0 : o.toAttribute) !== void 0
          ? s.converter
          : F
      ).toAttribute(i, s.type);
      ((this._$Em = t),
        n == null ? this.removeAttribute(e) : this.setAttribute(e, n),
        (this._$Em = null));
    }
  }
  _$AK(t, i) {
    var o, n;
    const s = this.constructor,
      e = s._$Eh.get(t);
    if (e !== void 0 && this._$Em !== e) {
      const d = s.getPropertyOptions(e),
        a =
          typeof d.converter == "function"
            ? { fromAttribute: d.converter }
            : ((o = d.converter) == null ? void 0 : o.fromAttribute) !== void 0
              ? d.converter
              : F;
      this._$Em = e;
      const h = a.fromAttribute(i, d.type);
      ((this[e] = h ?? ((n = this._$Ej) == null ? void 0 : n.get(e)) ?? h),
        (this._$Em = null));
    }
  }
  requestUpdate(t, i, s) {
    var e;
    if (t !== void 0) {
      const o = this.constructor,
        n = this[t];
      if (
        (s ?? (s = o.getPropertyOptions(t)),
        !(
          (s.hasChanged ?? rt)(n, i) ||
          (s.useDefault &&
            s.reflect &&
            n === ((e = this._$Ej) == null ? void 0 : e.get(t)) &&
            !this.hasAttribute(o._$Eu(t, s)))
        ))
      )
        return;
      this.C(t, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: s, reflect: e, wrapped: o }, n) {
    (s &&
      !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) &&
      (this._$Ej.set(t, n ?? i ?? this[t]), o !== !0 || n !== void 0)) ||
      (this._$AL.has(t) ||
        (this.hasUpdated || s || (i = void 0), this._$AL.set(t, i)),
      e === !0 &&
        this._$Em !== t &&
        (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
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
        for (const [o, n] of this._$Ep) this[o] = n;
        this._$Ep = void 0;
      }
      const e = this.constructor.elementProperties;
      if (e.size > 0)
        for (const [o, n] of e) {
          const { wrapped: d } = n,
            a = this[o];
          d !== !0 ||
            this._$AL.has(o) ||
            a === void 0 ||
            this.C(o, void 0, n, a);
        }
    }
    let t = !1;
    const i = this._$AL;
    try {
      ((t = this.shouldUpdate(i)),
        t
          ? (this.willUpdate(i),
            (s = this._$EO) == null ||
              s.forEach((e) => {
                var o;
                return (o = e.hostUpdate) == null ? void 0 : o.call(e);
              }),
            this.update(i))
          : this._$EM());
    } catch (e) {
      throw ((t = !1), this._$EM(), e);
    }
    t && this._$AE(i);
  }
  willUpdate(t) {}
  _$AE(t) {
    var i;
    ((i = this._$EO) == null ||
      i.forEach((s) => {
        var e;
        return (e = s.hostUpdated) == null ? void 0 : e.call(s);
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
    (this._$Eq && (this._$Eq = this._$Eq.forEach((i) => this._$ET(i, this[i]))),
      this._$EM());
  }
  updated(t) {}
  firstUpdated(t) {}
};
((z.elementStyles = []),
  (z.shadowRootOptions = { mode: "open" }),
  (z[I("elementProperties")] = /* @__PURE__ */ new Map()),
  (z[I("finalized")] = /* @__PURE__ */ new Map()),
  X == null || X({ ReactiveElement: z }),
  (S.reactiveElementVersions ?? (S.reactiveElementVersions = [])).push(
    "2.1.1",
  ));
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = globalThis,
  J = R.trustedTypes,
  ct = J ? J.createPolicy("lit-html", { createHTML: (r) => r }) : void 0,
  vt = "$lit$",
  A = `lit$${Math.random().toFixed(9).slice(2)}$`,
  $t = "?" + A,
  Tt = `<${$t}>`,
  U = document,
  L = () => U.createComment(""),
  Z = (r) => r === null || (typeof r != "object" && typeof r != "function"),
  ot = Array.isArray,
  Dt = (r) =>
    ot(r) || typeof (r == null ? void 0 : r[Symbol.iterator]) == "function",
  Y = `[ 	
\f\r]`,
  j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
  ht = /-->/g,
  pt = />/g,
  P = RegExp(
    `>|${Y}(?:([^\\s"'>=/]+)(${Y}*=${Y}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,
    "g",
  ),
  ut = /'/g,
  _t = /"/g,
  yt = /^(?:script|style|textarea|title)$/i,
  Ht =
    (r) =>
    (t, ...i) => ({ _$litType$: r, strings: t, values: i }),
  l = Ht(1),
  T = Symbol.for("lit-noChange"),
  u = Symbol.for("lit-nothing"),
  mt = /* @__PURE__ */ new WeakMap(),
  k = U.createTreeWalker(U, 129);
function bt(r, t) {
  if (!ot(r) || !r.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return ct !== void 0 ? ct.createHTML(t) : t;
}
const Nt = (r, t) => {
  const i = r.length - 1,
    s = [];
  let e,
    o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "",
    n = j;
  for (let d = 0; d < i; d++) {
    const a = r[d];
    let h,
      _,
      c = -1,
      x = 0;
    for (; x < a.length && ((n.lastIndex = x), (_ = n.exec(a)), _ !== null); )
      ((x = n.lastIndex),
        n === j
          ? _[1] === "!--"
            ? (n = ht)
            : _[1] !== void 0
              ? (n = pt)
              : _[2] !== void 0
                ? (yt.test(_[2]) && (e = RegExp("</" + _[2], "g")), (n = P))
                : _[3] !== void 0 && (n = P)
          : n === P
            ? _[0] === ">"
              ? ((n = e ?? j), (c = -1))
              : _[1] === void 0
                ? (c = -2)
                : ((c = n.lastIndex - _[2].length),
                  (h = _[1]),
                  (n = _[3] === void 0 ? P : _[3] === '"' ? _t : ut))
            : n === _t || n === ut
              ? (n = P)
              : n === ht || n === pt
                ? (n = j)
                : ((n = P), (e = void 0)));
    const w = n === P && r[d + 1].startsWith("/>") ? " " : "";
    o +=
      n === j
        ? a + Tt
        : c >= 0
          ? (s.push(h), a.slice(0, c) + vt + a.slice(c) + A + w)
          : a + A + (c === -2 ? d : w);
  }
  return [
    bt(
      r,
      o + (r[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : ""),
    ),
    s,
  ];
};
class B {
  constructor({ strings: t, _$litType$: i }, s) {
    let e;
    this.parts = [];
    let o = 0,
      n = 0;
    const d = t.length - 1,
      a = this.parts,
      [h, _] = Nt(t, i);
    if (
      ((this.el = B.createElement(h, s)),
      (k.currentNode = this.el.content),
      i === 2 || i === 3)
    ) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (e = k.nextNode()) !== null && a.length < d; ) {
      if (e.nodeType === 1) {
        if (e.hasAttributes())
          for (const c of e.getAttributeNames())
            if (c.endsWith(vt)) {
              const x = _[n++],
                w = e.getAttribute(c).split(A),
                W = /([.?@])?(.*)/.exec(x);
              (a.push({
                type: 1,
                index: o,
                name: W[2],
                strings: w,
                ctor:
                  W[1] === "." ? jt : W[1] === "?" ? It : W[1] === "@" ? Rt : Q,
              }),
                e.removeAttribute(c));
            } else
              c.startsWith(A) &&
                (a.push({ type: 6, index: o }), e.removeAttribute(c));
        if (yt.test(e.tagName)) {
          const c = e.textContent.split(A),
            x = c.length - 1;
          if (x > 0) {
            e.textContent = J ? J.emptyScript : "";
            for (let w = 0; w < x; w++)
              (e.append(c[w], L()),
                k.nextNode(),
                a.push({ type: 2, index: ++o }));
            e.append(c[x], L());
          }
        }
      } else if (e.nodeType === 8)
        if (e.data === $t) a.push({ type: 2, index: o });
        else {
          let c = -1;
          for (; (c = e.data.indexOf(A, c + 1)) !== -1; )
            (a.push({ type: 7, index: o }), (c += A.length - 1));
        }
      o++;
    }
  }
  static createElement(t, i) {
    const s = U.createElement("template");
    return ((s.innerHTML = t), s);
  }
}
function D(r, t, i = r, s) {
  var n, d;
  if (t === T) return t;
  let e = s !== void 0 ? ((n = i._$Co) == null ? void 0 : n[s]) : i._$Cl;
  const o = Z(t) ? void 0 : t._$litDirective$;
  return (
    (e == null ? void 0 : e.constructor) !== o &&
      ((d = e == null ? void 0 : e._$AO) == null || d.call(e, !1),
      o === void 0 ? (e = void 0) : ((e = new o(r)), e._$AT(r, i, s)),
      s !== void 0 ? ((i._$Co ?? (i._$Co = []))[s] = e) : (i._$Cl = e)),
    e !== void 0 && (t = D(r, e._$AS(r, t.values), e, s)),
    t
  );
}
class Mt {
  constructor(t, i) {
    ((this._$AV = []), (this._$AN = void 0), (this._$AD = t), (this._$AM = i));
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const {
        el: { content: i },
        parts: s,
      } = this._$AD,
      e = ((t == null ? void 0 : t.creationScope) ?? U).importNode(i, !0);
    k.currentNode = e;
    let o = k.nextNode(),
      n = 0,
      d = 0,
      a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let h;
        (a.type === 2
          ? (h = new q(o, o.nextSibling, this, t))
          : a.type === 1
            ? (h = new a.ctor(o, a.name, a.strings, this, t))
            : a.type === 6 && (h = new Lt(o, this, t)),
          this._$AV.push(h),
          (a = s[++d]));
      }
      n !== (a == null ? void 0 : a.index) && ((o = k.nextNode()), n++);
    }
    return ((k.currentNode = U), e);
  }
  p(t) {
    let i = 0;
    for (const s of this._$AV)
      (s !== void 0 &&
        (s.strings !== void 0
          ? (s._$AI(t, s, i), (i += s.strings.length - 2))
          : s._$AI(t[i])),
        i++);
  }
}
class q {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, i, s, e) {
    ((this.type = 2),
      (this._$AH = u),
      (this._$AN = void 0),
      (this._$AA = t),
      (this._$AB = i),
      (this._$AM = s),
      (this.options = e),
      (this._$Cv = (e == null ? void 0 : e.isConnected) ?? !0));
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return (
      i !== void 0 &&
        (t == null ? void 0 : t.nodeType) === 11 &&
        (t = i.parentNode),
      t
    );
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    ((t = D(this, t, i)),
      Z(t)
        ? t === u || t == null || t === ""
          ? (this._$AH !== u && this._$AR(), (this._$AH = u))
          : t !== this._$AH && t !== T && this._(t)
        : t._$litType$ !== void 0
          ? this.$(t)
          : t.nodeType !== void 0
            ? this.T(t)
            : Dt(t)
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
    (this._$AH !== u && Z(this._$AH)
      ? (this._$AA.nextSibling.data = t)
      : this.T(U.createTextNode(t)),
      (this._$AH = t));
  }
  $(t) {
    var o;
    const { values: i, _$litType$: s } = t,
      e =
        typeof s == "number"
          ? this._$AC(t)
          : (s.el === void 0 &&
              (s.el = B.createElement(bt(s.h, s.h[0]), this.options)),
            s);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === e) this._$AH.p(i);
    else {
      const n = new Mt(e, this),
        d = n.u(this.options);
      (n.p(i), this.T(d), (this._$AH = n));
    }
  }
  _$AC(t) {
    let i = mt.get(t.strings);
    return (i === void 0 && mt.set(t.strings, (i = new B(t))), i);
  }
  k(t) {
    ot(this._$AH) || ((this._$AH = []), this._$AR());
    const i = this._$AH;
    let s,
      e = 0;
    for (const o of t)
      (e === i.length
        ? i.push((s = new q(this.O(L()), this.O(L()), this, this.options)))
        : (s = i[e]),
        s._$AI(o),
        e++);
    e < i.length && (this._$AR(s && s._$AB.nextSibling, e), (i.length = e));
  }
  _$AR(t = this._$AA.nextSibling, i) {
    var s;
    for (
      (s = this._$AP) == null ? void 0 : s.call(this, !1, !0, i);
      t !== this._$AB;
    ) {
      const e = t.nextSibling;
      (t.remove(), (t = e));
    }
  }
  setConnected(t) {
    var i;
    this._$AM === void 0 &&
      ((this._$Cv = t), (i = this._$AP) == null || i.call(this, t));
  }
}
class Q {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, s, e, o) {
    ((this.type = 1),
      (this._$AH = u),
      (this._$AN = void 0),
      (this.element = t),
      (this.name = i),
      (this._$AM = e),
      (this.options = o),
      s.length > 2 || s[0] !== "" || s[1] !== ""
        ? ((this._$AH = Array(s.length - 1).fill(new String())),
          (this.strings = s))
        : (this._$AH = u));
  }
  _$AI(t, i = this, s, e) {
    const o = this.strings;
    let n = !1;
    if (o === void 0)
      ((t = D(this, t, i, 0)),
        (n = !Z(t) || (t !== this._$AH && t !== T)),
        n && (this._$AH = t));
    else {
      const d = t;
      let a, h;
      for (t = o[0], a = 0; a < o.length - 1; a++)
        ((h = D(this, d[s + a], i, a)),
          h === T && (h = this._$AH[a]),
          n || (n = !Z(h) || h !== this._$AH[a]),
          h === u ? (t = u) : t !== u && (t += (h ?? "") + o[a + 1]),
          (this._$AH[a] = h));
    }
    n && !e && this.j(t);
  }
  j(t) {
    t === u
      ? this.element.removeAttribute(this.name)
      : this.element.setAttribute(this.name, t ?? "");
  }
}
class jt extends Q {
  constructor() {
    (super(...arguments), (this.type = 3));
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class It extends Q {
  constructor() {
    (super(...arguments), (this.type = 4));
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Rt extends Q {
  constructor(t, i, s, e, o) {
    (super(t, i, s, e, o), (this.type = 5));
  }
  _$AI(t, i = this) {
    if ((t = D(this, t, i, 0) ?? u) === T) return;
    const s = this._$AH,
      e =
        (t === u && s !== u) ||
        t.capture !== s.capture ||
        t.once !== s.once ||
        t.passive !== s.passive,
      o = t !== u && (s === u || e);
    (e && this.element.removeEventListener(this.name, this, s),
      o && this.element.addEventListener(this.name, this, t),
      (this._$AH = t));
  }
  handleEvent(t) {
    var i;
    typeof this._$AH == "function"
      ? this._$AH.call(
          ((i = this.options) == null ? void 0 : i.host) ?? this.element,
          t,
        )
      : this._$AH.handleEvent(t);
  }
}
class Lt {
  constructor(t, i, s) {
    ((this.element = t),
      (this.type = 6),
      (this._$AN = void 0),
      (this._$AM = i),
      (this.options = s));
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    D(this, t);
  }
}
const tt = R.litHtmlPolyfillSupport;
(tt == null || tt(B, q),
  (R.litHtmlVersions ?? (R.litHtmlVersions = [])).push("3.3.1"));
const Zt = (r, t, i) => {
  const s = (i == null ? void 0 : i.renderBefore) ?? t;
  let e = s._$litPart$;
  if (e === void 0) {
    const o = (i == null ? void 0 : i.renderBefore) ?? null;
    s._$litPart$ = e = new q(t.insertBefore(L(), o), o, void 0, i ?? {});
  }
  return (e._$AI(r), e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis;
class $ extends z {
  constructor() {
    (super(...arguments),
      (this.renderOptions = { host: this }),
      (this._$Do = void 0));
  }
  createRenderRoot() {
    var i;
    const t = super.createRenderRoot();
    return (
      (i = this.renderOptions).renderBefore ?? (i.renderBefore = t.firstChild),
      t
    );
  }
  update(t) {
    const i = this.render();
    (this.hasUpdated || (this.renderOptions.isConnected = this.isConnected),
      super.update(t),
      (this._$Do = Zt(i, this.renderRoot, this.renderOptions)));
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
    return T;
  }
}
var gt;
(($._$litElement$ = !0),
  ($.finalized = !0),
  (gt = O.litElementHydrateSupport) == null || gt.call(O, { LitElement: $ }));
const et = O.litElementPolyfillSupport;
et == null || et({ LitElement: $ });
(O.litElementVersions ?? (O.litElementVersions = [])).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const N = (r) => (t, i) => {
  i !== void 0
    ? i.addInitializer(() => {
        customElements.define(r, t);
      })
    : customElements.define(r, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bt = {
    attribute: !0,
    type: String,
    converter: F,
    reflect: !1,
    hasChanged: rt,
  },
  qt = (r = Bt, t, i) => {
    const { kind: s, metadata: e } = i;
    let o = globalThis.litPropertyMetadata.get(e);
    if (
      (o === void 0 &&
        globalThis.litPropertyMetadata.set(e, (o = /* @__PURE__ */ new Map())),
      s === "setter" && ((r = Object.create(r)).wrapped = !0),
      o.set(i.name, r),
      s === "accessor")
    ) {
      const { name: n } = i;
      return {
        set(d) {
          const a = t.get.call(this);
          (t.set.call(this, d), this.requestUpdate(n, a, r));
        },
        init(d) {
          return (d !== void 0 && this.C(n, void 0, r, d), d);
        },
      };
    }
    if (s === "setter") {
      const { name: n } = i;
      return function (d) {
        const a = this[n];
        (t.call(this, d), this.requestUpdate(n, a, r));
      };
    }
    throw Error("Unsupported decorator location: " + s);
  };
function g(r) {
  return (t, i) =>
    typeof i == "object"
      ? qt(r, t, i)
      : ((s, e, o) => {
          const n = e.hasOwnProperty(o);
          return (
            e.constructor.createProperty(o, s),
            n ? Object.getOwnPropertyDescriptor(e, o) : void 0
          );
        })(r, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function p(r) {
  return g({ ...r, state: !0, attribute: !1 });
}
var Wt = Object.defineProperty,
  Vt = Object.getOwnPropertyDescriptor,
  b = (r, t, i, s) => {
    for (
      var e = s > 1 ? void 0 : s ? Vt(t, i) : t, o = r.length - 1, n;
      o >= 0;
      o--
    )
      (n = r[o]) && (e = (s ? n(t, i, e) : n(e)) || e);
    return (s && e && Wt(t, i, e), e);
  };
let f = class extends $ {
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
  updated(r) {
    if (r.has("open") && this.open && this.preselected) {
      const t = this.entities.find((i) => i.entity_id === this.preselected);
      t &&
        ((this._name = t.area_name || t.name || t.entity_id.split(".")[1]),
        this._heaters.clear(),
        this._coolers.clear(),
        this._windowSensors.clear(),
        t.domain === "climate"
          ? (this._heaters.add(t.entity_id),
            (this._temperatureSensor = t.entity_id))
          : t.domain === "switch" && this._heaters.add(t.entity_id),
        this.requestUpdate());
    }
  }
  _getEntityList(r) {
    return this.entities.filter((t) => r.includes(t.domain));
  }
  _toggleSet(r, t) {
    (r.has(t) ? r.delete(t) : r.add(t), this.requestUpdate());
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
    const r = this._getEntityList(["climate", "switch"]),
      t = this._getEntityList(["climate"]),
      i = this._getEntityList(["binary_sensor"]),
      s = this.entities.filter(
        (e) =>
          (e.domain === "sensor" && e.device_class === "temperature") ||
          e.domain === "climate",
      );
    return l`
      <div class="dialog">
        <h2>Adopt Zone</h2>
        
        <div class="field">
          <label>Zone Name</label>
          <input type="text" .value=${this._name} @input=${(e) => (this._name = e.target.value)}>
        </div>

        <div class="field">
            <label>Temperature Sensor</label>
            <select @change=${(e) => (this._temperatureSensor = e.target.value)}>
                <option value="">Select Sensor</option>
                ${s.map(
                  (e) => l`
                    <option value="${e.entity_id}" ?selected=${this._temperatureSensor === e.entity_id}>${e.name || e.entity_id} (${e.entity_id})</option>
                `,
                )}
            </select>
        </div>

        <div class="field">
            <label>Heaters</label>
            <div class="checkbox-list">
                ${r.map(
                  (e) => l`
                    <div class="checkbox-item">
                        <input type="checkbox" 
                            ?checked=${this._heaters.has(e.entity_id)}
                            @change=${() => this._toggleSet(this._heaters, e.entity_id)}>
                        <span>${e.name || e.entity_id} (${e.domain})</span>
                    </div>
                `,
                )}
            </div>
        </div>

        <div class="field">
            <label>Coolers</label>
            <div class="checkbox-list">
                ${t.map(
                  (e) => l`
                    <div class="checkbox-item">
                        <input type="checkbox" 
                            ?checked=${this._coolers.has(e.entity_id)}
                            @change=${() => this._toggleSet(this._coolers, e.entity_id)}>
                        <span>${e.name || e.entity_id}</span>
                    </div>
                `,
                )}
            </div>
        </div>
        
        <div class="field">
            <label>Window Sensors</label>
            <div class="checkbox-list">
                ${i.map(
                  (e) => l`
                    <div class="checkbox-item">
                        <input type="checkbox" 
                            ?checked=${this._windowSensors.has(e.entity_id)}
                            @change=${() => this._toggleSet(this._windowSensors, e.entity_id)}>
                        <span>${e.name || e.entity_id}</span>
                    </div>
                `,
                )}
            </div>
        </div>

        <div class="actions">
          <button class="cancel" @click=${() => this.dispatchEvent(new CustomEvent("close"))}>Cancel</button>
          <button class="save" @click=${this._save}>Create Zone</button>
        </div>
      </div>
    `;
  }
};
f.styles = H`
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
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-height: 90vh;
      overflow-y: auto;
    }
    h2 { margin-top: 0; }
    .field { margin-bottom: 16px; }
    label { display: block; margin-bottom: 8px; font-weight: 500; }
    input[type="text"], select {
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
    .cancel { background: transparent; color: var(--primary-text-color); border: 1px solid var(--divider-color); }
    .save { background: var(--primary-color, #03a9f4); color: white; }
  `;
b([g({ attribute: !1 })], f.prototype, "hass", 2);
b([g({ type: Boolean, reflect: !0 })], f.prototype, "open", 2);
b([g({ attribute: !1 })], f.prototype, "entities", 2);
b([g({ attribute: !1 })], f.prototype, "preselected", 2);
b([p()], f.prototype, "_name", 2);
b([p()], f.prototype, "_temperatureSensor", 2);
b([p()], f.prototype, "_heaters", 2);
b([p()], f.prototype, "_coolers", 2);
b([p()], f.prototype, "_windowSensors", 2);
f = b([N("adopt-dialog")], f);
var Ft = Object.defineProperty,
  Jt = Object.getOwnPropertyDescriptor,
  M = (r, t, i, s) => {
    for (
      var e = s > 1 ? void 0 : s ? Jt(t, i) : t, o = r.length - 1, n;
      o >= 0;
      o--
    )
      (n = r[o]) && (e = (s ? n(t, i, e) : n(e)) || e);
    return (s && e && Ft(t, i, e), e);
  };
let E = class extends $ {
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
      } catch (r) {
        console.error("Failed to fetch devices", r);
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
    const r = this._devices.filter((t) =>
      ["climate", "switch"].includes(t.domain),
    );
    return r.length === 0
      ? l`<div class="empty">
        No unmanaged actuators found.
      </div>`
      : l`
      <div class="list">
        ${r.map(
          (t) => l`
            <div class="item">
              <div class="item-info">
                <span class="icon">
                  <ha-icon icon="${t.domain === "switch" ? "mdi:power-socket" : "mdi:thermostat"}"></ha-icon>
                </span>
                <div>
                  <div>${t.name || t.entity_id}</div>
                  <div
                    style="font-size: 0.8em; color: var(--secondary-text-color); display: flex; align-items: center; margin-top: 2px;"
                  >
                    ${t.area_name ? l`<span class="area-badge">${t.area_name}</span>` : ""}
                    ${t.entity_id} • ${t.state}
                  </div>
                </div>
              </div>
              <button class="adopt-btn" @click=${() => this._openDialog(t.entity_id)}>
                Adopt
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }
  _openDialog(r) {
    ((this._selectedEntity = r), (this._dialogOpen = !0));
  }
  _closeDialog() {
    ((this._dialogOpen = !1),
      (this._selectedEntity = null),
      this._fetchDevices());
  }
};
E.styles = H`
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
M([g({ attribute: !1 })], E.prototype, "hass", 2);
M([p()], E.prototype, "_devices", 2);
M([p()], E.prototype, "_loading", 2);
M([p()], E.prototype, "_dialogOpen", 2);
M([p()], E.prototype, "_selectedEntity", 2);
E = M([N("setup-view")], E);
var Kt = Object.defineProperty,
  Gt = Object.getOwnPropertyDescriptor,
  xt = (r, t, i, s) => {
    for (
      var e = s > 1 ? void 0 : s ? Gt(t, i) : t, o = r.length - 1, n;
      o >= 0;
      o--
    )
      (n = r[o]) && (e = (s ? n(t, i, e) : n(e)) || e);
    return (s && e && Kt(t, i, e), e);
  };
let K = class extends $ {
  render() {
    if (!this.hass) return l``;
    const r = Object.values(this.hass.states).filter(
      (t) => t.attributes.is_climate_dashboard_zone,
    );
    return l`
      <div class="card">
        <h2>Timeline (Managed Zones)</h2>
        ${r.length === 0 ? l`<p>No zones adopted yet.</p>` : r.map((t) => this._renderZone(t))}
      </div>
    `;
  }
  _renderZone(r) {
    const t = r.attributes.schedule || [];
    return l`
      <div class="zone-item">
        <div class="zone-header">
          <span>${r.attributes.friendly_name || r.entity_id}</span>
          <span>${r.state} (${r.attributes.temperature}°C)</span>
        </div>
        <div class="schedule-list">
          ${
            t.length === 0
              ? l`No schedule set`
              : t.map(
                  (i) => l`
                  <span class="block">
                    ${i.name}: ${i.start_time} -> ${i.target_temp}°C
                  </span>
                `,
                )
          }
        </div>
      </div>
    `;
  }
};
K.styles = H`
    :host {
      display: block;
      padding: 16px;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    h2 {
      margin-top: 0;
    }
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
xt([g({ attribute: !1 })], K.prototype, "hass", 2);
K = xt([N("timeline-view")], K);
var Qt = Object.defineProperty,
  Xt = Object.getOwnPropertyDescriptor,
  wt = (r, t, i, s) => {
    for (
      var e = s > 1 ? void 0 : s ? Xt(t, i) : t, o = r.length - 1, n;
      o >= 0;
      o--
    )
      (n = r[o]) && (e = (s ? n(t, i, e) : n(e)) || e);
    return (s && e && Qt(t, i, e), e);
  };
let G = class extends $ {
  render() {
    const r = this._getZones();
    return r.length === 0
      ? l`
            <div class="empty">
                <p>No zones configured yet.</p>
                <p>Use the Setup button above to adopt devices.</p>
            </div>
        `
      : l`
      <div class="grid">
        ${r.map((t) => this._renderZoneCard(t))}
      </div>
    `;
  }
  _getZones() {
    return this.hass
      ? Object.values(this.hass.states).filter((r) =>
          r.entity_id.startsWith("climate.zone_"),
        )
      : [];
  }
  _renderZoneCard(r) {
    const t = r.state === "heat",
      i = r.state === "cool";
    let s = "mdi:thermostat",
      e = "";
    t
      ? ((s = "mdi:fire"), (e = "var(--state-climate-heat-color, #ff9800)"))
      : i &&
        ((s = "mdi:snowflake"),
        (e = "var(--state-climate-cool-color, #2b9af9)"));
    const o = r.attributes.current_temperature;
    return l`
        <div class="card" @click=${() => this._openZone(r.entity_id)}>
            <div class="icon" style="color: ${e || "inherit"}">
                <ha-icon icon="${s}"></ha-icon>
            </div>
            <div class="name">${r.attributes.friendly_name || r.entity_id}</div>
            <div class="temp">
                ${o != null ? `${o}°` : "--"}
            </div>
            <div class="state">${r.state}</div>
        </div>
      `;
  }
  _openZone(r) {
    this.dispatchEvent(
      new CustomEvent("zone-selected", {
        detail: { entityId: r },
        bubbles: !0,
        composed: !0,
      }),
    );
  }
};
G.styles = H`
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
  `;
wt([g({ attribute: !1 })], G.prototype, "hass", 2);
G = wt([N("zones-view")], G);
var Yt = Object.defineProperty,
  te = Object.getOwnPropertyDescriptor,
  v = (r, t, i, s) => {
    for (
      var e = s > 1 ? void 0 : s ? te(t, i) : t, o = r.length - 1, n;
      o >= 0;
      o--
    )
      (n = r[o]) && (e = (s ? n(t, i, e) : n(e)) || e);
    return (s && e && Yt(t, i, e), e);
  };
let m = class extends $ {
  constructor() {
    (super(...arguments),
      (this.allEntities = []),
      (this._uniqueId = ""),
      (this._name = ""),
      (this._temperatureSensor = ""),
      (this._heaters = /* @__PURE__ */ new Set()),
      (this._coolers = /* @__PURE__ */ new Set()),
      (this._windowSensors = /* @__PURE__ */ new Set()),
      (this._loading = !1),
      (this._error = ""));
  }
  async firstUpdated() {
    await this._loadConfig();
  }
  async _loadConfig() {
    if (!this.hass || !this.zoneId) return;
    this._loading = !0;
    const r = this.hass.states[this.zoneId];
    if (!r) {
      ((this._error = "Zone not found"), (this._loading = !1));
      return;
    }
    try {
      const t = await this.hass.callWS({
        type: "config/entity_registry/get",
        entity_id: this.zoneId,
      });
      this._uniqueId = t.unique_id;
      const i = r.attributes;
      ((this._name = i.friendly_name || ""),
        (this._temperatureSensor =
          i.temperature_sensor || i.sensor_entity_id || ""),
        (this._heaters = new Set(
          i.heaters || (i.actuator_entity_id ? [i.actuator_entity_id] : []),
        )),
        (this._coolers = new Set(i.coolers || [])),
        (this._windowSensors = new Set(i.window_sensors || [])));
    } catch (t) {
      (console.error("Error loading zone config", t),
        (this._error = "Failed to load zone configuration"));
    }
    this._loading = !1;
  }
  _toggleSet(r, t) {
    (r.has(t) ? r.delete(t) : r.add(t), this.requestUpdate());
  }
  _getEntityList(r) {
    return this.allEntities.filter((t) => r.includes(t.domain));
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
      }),
        this._goBack());
    } catch (r) {
      alert("Update failed: " + r.message);
    }
  }
  _goBack() {
    this.dispatchEvent(new CustomEvent("close"));
  }
  render() {
    if (this._loading) return l`<div class="card">Loading...</div>`;
    if (this._error) return l`<div class="card">Error: ${this._error}</div>`;
    const r = this._getEntityList(["climate", "switch"]),
      t = this._getEntityList(["climate"]),
      i = this._getEntityList(["binary_sensor"]),
      s = this.allEntities.filter(
        (e) =>
          (e.domain === "sensor" && e.device_class === "temperature") ||
          e.domain === "climate",
      );
    return l`
            <div class="card">
                <h2>Edit Zone: ${this._name}</h2>
                
                <div class="field">
                  <label>Zone Name</label>
                  <input type="text" .value=${this._name} @input=${(e) => (this._name = e.target.value)}>
                </div>

                <div class="field">
                    <label>Temperature Sensor</label>
                    <select @change=${(e) => (this._temperatureSensor = e.target.value)}>
                        <option value="">Select Sensor</option>
                        ${s.map(
                          (e) => l`
                            <option value="${e.entity_id}" ?selected=${this._temperatureSensor === e.entity_id}>${e.name || e.entity_id} (${e.entity_id})</option>
                        `,
                        )}
                    </select>
                </div>

                <div class="field">
                    <label>Heaters</label>
                    <div class="checkbox-list">
                        ${r.map(
                          (e) => l`
                            <div class="checkbox-item">
                                <input type="checkbox" 
                                    ?checked=${this._heaters.has(e.entity_id)}
                                    @change=${() => this._toggleSet(this._heaters, e.entity_id)}>
                                <span>${e.name || e.entity_id} (${e.domain})</span>
                            </div>
                        `,
                        )}
                    </div>
                </div>

                <div class="field">
                    <label>Coolers</label>
                    <div class="checkbox-list">
                        ${t.map(
                          (e) => l`
                            <div class="checkbox-item">
                                <input type="checkbox" 
                                    ?checked=${this._coolers.has(e.entity_id)}
                                    @change=${() => this._toggleSet(this._coolers, e.entity_id)}>
                                <span>${e.name || e.entity_id}</span>
                            </div>
                        `,
                        )}
                    </div>
                </div>
                
                <div class="field">
                    <label>Window Sensors</label>
                    <div class="checkbox-list">
                        ${i.map(
                          (e) => l`
                            <div class="checkbox-item">
                                <input type="checkbox" 
                                    ?checked=${this._windowSensors.has(e.entity_id)}
                                    @change=${() => this._toggleSet(this._windowSensors, e.entity_id)}>
                                <span>${e.name || e.entity_id}</span>
                            </div>
                        `,
                        )}
                    </div>
                </div>

                <div class="actions">
                  <button class="delete" @click=${() => alert("Delete not implemented")}>Delete Helper</button>
                  <button class="cancel" @click=${this._goBack}>Cancel</button>
                  <button class="save" @click=${this._save}>Save Changes</button>
                </div>
            </div>
        `;
  }
};
m.styles = H`
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
    h2 { margin-top: 0; display: flex; align-items: center; justify-content: space-between; }
    .field { margin-bottom: 16px; }
    label { display: block; margin-bottom: 8px; font-weight: 500; }
    input[type="text"], select {
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
    .cancel { background: transparent; color: var(--primary-text-color); border: 1px solid var(--divider-color); }
    .save { background: var(--primary-color, #03a9f4); color: white; }
    .delete { background: var(--error-color, #f44336); color: white; margin-right: auto; }
  `;
v([g({ attribute: !1 })], m.prototype, "hass", 2);
v([g({ attribute: !1 })], m.prototype, "zoneId", 2);
v([g({ attribute: !1 })], m.prototype, "allEntities", 2);
v([p()], m.prototype, "_uniqueId", 2);
v([p()], m.prototype, "_name", 2);
v([p()], m.prototype, "_temperatureSensor", 2);
v([p()], m.prototype, "_heaters", 2);
v([p()], m.prototype, "_coolers", 2);
v([p()], m.prototype, "_windowSensors", 2);
v([p()], m.prototype, "_loading", 2);
v([p()], m.prototype, "_error", 2);
m = v([N("zone-editor")], m);
var ee = Object.defineProperty,
  ie = Object.getOwnPropertyDescriptor,
  C = (r, t, i, s) => {
    for (
      var e = s > 1 ? void 0 : s ? ie(t, i) : t, o = r.length - 1, n;
      o >= 0;
      o--
    )
      (n = r[o]) && (e = (s ? n(t, i, e) : n(e)) || e);
    return (s && e && ee(t, i, e), e);
  };
let y = class extends $ {
  constructor() {
    (super(...arguments),
      (this._view = "zones"),
      (this._editingZoneId = null),
      (this._unmanagedCount = 0),
      (this._allEntities = []));
  }
  firstUpdated() {
    this._scanForBadge();
  }
  async _scanForBadge() {
    if (this.hass)
      try {
        const r = await this.hass.callWS({ type: "climate_dashboard/scan" });
        this._allEntities = r;
        const t = r.filter((i) => ["climate", "switch"].includes(i.domain));
        this._unmanagedCount = t.length;
      } catch (r) {
        console.error("Badge scan failed", r);
      }
  }
  _handleZoneClick(r) {
    ((this._editingZoneId = r.detail.entityId), (this._view = "editor"));
  }
  render() {
    return l`
      <div class="header">
        ${
          this._view !== "zones"
            ? l`
            <button class="icon-btn" @click=${() => {
              ((this._view = "zones"), (this._editingZoneId = null));
            }}>
                <ha-icon icon="mdi:arrow-left"></ha-icon>
            </button>
        `
            : l`<div style="width: 40px;"></div>`
        }
        
        <div class="title">Climate</div>
        
        <div class="actions">
            <!-- Timeline Toggle -->
            <button class="icon-btn" @click=${() => (this._view = "timeline")} ?hidden=${this._view === "timeline" || this._view === "editor"}>
                <ha-icon icon="mdi:chart-timeline"></ha-icon>
            </button>

            <!-- Setup Toggle (Badge) -->
            <button class="icon-btn" @click=${() => (this._view = "setup")} ?hidden=${this._view === "editor"}>
                <ha-icon icon="mdi:cog"></ha-icon>
                ${this._unmanagedCount > 0 ? l`<span class="badge">${this._unmanagedCount}</span>` : ""}
            </button>
        </div>
      </div>

      <div class="content">
        ${this._view === "zones" ? l`<zones-view .hass=${this.hass} @zone-selected=${this._handleZoneClick}></zones-view>` : ""}
        ${this._view === "setup" ? l`<setup-view .hass=${this.hass}></setup-view>` : ""}
        ${this._view === "timeline" ? l`<timeline-view .hass=${this.hass}></timeline-view>` : ""}
        ${
          this._view === "editor" && this._editingZoneId
            ? l`
            <zone-editor 
                .hass=${this.hass} 
                .zoneId=${this._editingZoneId}
                .allEntities=${this._allEntities}
                @close=${() => {
                  ((this._view = "zones"), (this._editingZoneId = null));
                }}
            ></zone-editor>
        `
            : ""
        }
      </div>
    `;
  }
};
y.styles = H`
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
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
        background: rgba(255,255,255,0.1);
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
C([g({ attribute: !1 })], y.prototype, "hass", 2);
C([g({ attribute: !1 })], y.prototype, "narrow", 2);
C([g({ attribute: !1 })], y.prototype, "panel", 2);
C([p()], y.prototype, "_view", 2);
C([p()], y.prototype, "_editingZoneId", 2);
C([p()], y.prototype, "_unmanagedCount", 2);
C([p()], y.prototype, "_allEntities", 2);
y = C([N("climate-dashboard")], y);
console.info(
  "%c CLIMATE-DASHBOARD %c 0.0.1 ",
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;",
);
