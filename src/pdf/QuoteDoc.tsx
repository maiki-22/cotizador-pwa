// src/pdf/QuoteDoc.tsx
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Quote, QuoteItem, Brand } from "../models";
import type { ItemType } from "../stores/quoteDraft";
import { imageForQuote } from "../catalog/imageCatalog";

// ✅ Helper: respeta el base path de GH Pages (Vite)
const withBase = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, "");

// Registra Roboto (rutas compatibles con GH Pages)
try {
  Font.register({
    family: "Roboto",
    src: withBase("fonts/Roboto-Regular.ttf"),
  });
  Font.register({
    family: "Roboto-Bold",
    src: withBase("fonts/Roboto-Bold.ttf"),
  });
} catch {}

// 🎨 COLORES PROFESIONALES
const COLORS = {
  primary: "#1e40af",
  primaryLight: "#3b82f6",
  dark: "#111827",
  gray: "#6b7280",
  grayLight: "#f3f4f6",
  grayBorder: "#e5e7eb",
  white: "#ffffff",
  success: "#059669",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 10,
    lineHeight: 1.4,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },

  // ============= HEADER MODERNO =============
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },

  companySection: {
    maxWidth: 320,
  },

  companyName: {
    fontFamily: "Roboto-Bold",
    fontSize: 24,
    color: COLORS.primary,
    marginBottom: 16,
    letterSpacing: 0.3,
  },

  companyInfoSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
  },

  companyInfo: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 3,
  },

  companyInfoLabel: {
    fontFamily: "Roboto-Bold",
    color: COLORS.dark,
  },

  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.grayLight,
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  // ============= TÍTULO Y METADATA =============
  quoteHeader: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },

  quoteTitle: {
    fontFamily: "Roboto-Bold",
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 4,
  },

  quoteMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  quoteMetaItem: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.9,
  },

  // ============= SECCIONES CON CARDS =============
  sectionCard: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontFamily: "Roboto-Bold",
    fontSize: 12,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // ============= KEY-VALUE PAIRS =============
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  infoLabel: {
    width: 100,
    fontFamily: "Roboto-Bold",
    fontSize: 9,
    color: COLORS.gray,
    textTransform: "uppercase",
  },

  infoValue: {
    flex: 1,
    fontSize: 10,
    color: COLORS.dark,
  },

  // ============= ITEMS MEJORADOS =============
  itemContainer: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 8,
  },

  itemHeader: {
    backgroundColor: COLORS.primary,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemNumber: {
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    fontFamily: "Roboto-Bold",
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  itemTitle: {
    flex: 1,
    fontFamily: "Roboto-Bold",
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 12,
  },

  itemBody: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: COLORS.white,
  },

  itemDetails: {
    flex: 1,
    paddingRight: 16,
  },

  itemImageSection: {
    width: 180,
    alignItems: "center",
  },

  itemImage: {
    width: 160,
    height: 120,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: COLORS.grayLight,
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  detailRow: {
    flexDirection: "row",
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },

  detailLabel: {
    width: 90,
    fontSize: 9,
    color: COLORS.gray,
    textTransform: "uppercase",
  },

  detailValue: {
    flex: 1,
    fontSize: 10,
    color: COLORS.dark,
  },

  detailValueBold: {
    flex: 1,
    fontFamily: "Roboto-Bold",
    fontSize: 10,
    color: COLORS.dark,
  },

  // ============= PRICING =============
  itemPricing: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.grayBorder,
  },

  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  pricingLabel: {
    fontSize: 9,
    color: COLORS.gray,
  },

  pricingValue: {
    fontSize: 10,
    color: COLORS.dark,
  },

  pricingTotal: {
    fontFamily: "Roboto-Bold",
    fontSize: 11,
    color: COLORS.primary,
  },

  // ============= TOTALES DESTACADOS =============
  totalsContainer: {
    backgroundColor: COLORS.dark,
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  totalLabel: {
    fontSize: 11,
    color: COLORS.grayLight,
  },

  totalValue: {
    fontFamily: "Roboto-Bold",
    fontSize: 12,
    color: COLORS.white,
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },

  grandTotalLabel: {
    fontFamily: "Roboto-Bold",
    fontSize: 14,
    color: COLORS.white,
  },

  grandTotalValue: {
    fontFamily: "Roboto-Bold",
    fontSize: 18,
    color: COLORS.white,
  },

  // ============= CONDICIONES =============
  conditionsList: {
    marginTop: 20,
  },

  conditionItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 8,
  },

  conditionBullet: {
    width: 20,
    fontFamily: "Roboto-Bold",
    fontSize: 14,
    color: COLORS.primary,
  },

  conditionText: {
    flex: 1,
    fontSize: 10,
    color: COLORS.dark,
    lineHeight: 1.5,
  },

  // ============= FOOTER =============
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerText: {
    fontSize: 8,
    color: COLORS.gray,
  },
});

const fmtCL = new Intl.NumberFormat("es-CL");
const fmtMoney = (cents: number) => `$${fmtCL.format(Math.round(cents / 100))}`;
const fmtInt = (v?: number | null) => (v == null ? "" : fmtCL.format(v));

const formatDateCL = (ms: number) =>
  new Date(ms).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const pad2 = (n: number) => `${n}`.padStart(2, "0");

function materialDisplay(m?: string) {
  if (!m) return "N/A";
  const s = m.toLowerCase();
  if (s.includes("madera")) return "Madera";
  if (s.includes("blanco")) return "PVC Blanco";
  if (s.includes("aluminio")) return "Aluminio";
  return m;
}

function glassDisplay(t?: string) {
  if (!t) return "N/A";
  return t.includes("termo") ? "Termopanel" : t;
}

const colorDisplay = (c?: string) => c || "N/A";

export function QuoteDoc({
  quote,
  items,
  brand,
  // 👇 Logo por defecto con BASE_URL (GH Pages)
  logoSrc = withBase("icons/icon-192.png"),
}: {
  quote: Quote;
  items: (QuoteItem & { type?: ItemType; options?: any })[];
  brand: Brand;
  logoSrc?: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header moderno */}
        <View style={styles.headerContainer}>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>{brand.COMPANY_NAME}</Text>

            <View style={styles.companyInfoSection}>
              {brand.COMPANY_RUT && (
                <Text style={styles.companyInfo}>
                  <Text style={styles.companyInfoLabel}>RUT: </Text>
                  {brand.COMPANY_RUT}
                </Text>
              )}

              {brand.COMPANY_EMAIL && (
                <Text style={styles.companyInfo}>
                  <Text style={styles.companyInfoLabel}>Email: </Text>
                  {brand.COMPANY_EMAIL}
                </Text>
              )}

              {brand.COMPANY_PHONE && (
                <Text style={styles.companyInfo}>
                  <Text style={styles.companyInfoLabel}>Teléfono: </Text>
                  {brand.COMPANY_PHONE}
                </Text>
              )}

              {brand.COMPANY_ADDRESS && (
                <Text style={styles.companyInfo}>
                  <Text style={styles.companyInfoLabel}>Dirección: </Text>
                  {brand.COMPANY_ADDRESS}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.logoContainer}>
            <Image src={logoSrc} style={styles.logo} />
          </View>
        </View>

        {/* Título de cotización */}
        <View style={styles.quoteHeader}>
          <Text style={styles.quoteTitle}>COTIZACIÓN N° {quote.number}</Text>
          <View style={styles.quoteMeta}>
            <Text style={styles.quoteMetaItem}>
              Fecha: {formatDateCL(quote.dateMillis)}
            </Text>
            <Text style={styles.quoteMetaItem}>Válida por 15 días</Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cliente</Text>

          {quote.clientName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{quote.clientName}</Text>
            </View>
          )}

          {quote.clientEmail && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{quote.clientEmail}</Text>
            </View>
          )}

          {quote.clientPhone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{quote.clientPhone}</Text>
            </View>
          )}

          {quote.clientAddress && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección</Text>
              <Text style={styles.infoValue}>{quote.clientAddress}</Text>
            </View>
          )}
        </View>

        {/* Items */}
        {items.map((it, idx) => {
          const imgSrc = imageForQuote(
            it.type as ItemType,
            (it as any).options ?? {}
          );
          const qty = it.quantity ?? 1;
          const unit = it.unitPriceCents ?? 0;
          const sub = it.subtotalCents ?? Math.round(unit * qty);

          const t = it.type as ItemType | undefined;
          const isShower = t === "shower";
          const isCurtain = t === "muro_cortina";
          const isTabBanho = t === "tabiqueria_banho";
          const showGlassBase = !isTabBanho && !isShower && !isCurtain;
          const showGlassForShower =
            isShower && it.options?.showerType === "Vidrio laminado";
          const showGlassForCurtain =
            isCurtain && it.options?.curtainWallType === "Vidrio";
          const showGlass =
            showGlassBase || showGlassForShower || showGlassForCurtain;

          return (
            <View
              key={it.title + idx}
              style={styles.itemContainer}
              minPresenceAhead={120}
            >
              {/* Header del item */}
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>#{pad2(idx + 1)}</Text>
                <Text style={styles.itemTitle}>{it.title}</Text>
              </View>

              {/* Body del item */}
              <View style={styles.itemBody}>
                {/* Detalles */}
                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ancho</Text>
                    <Text style={styles.detailValue}>
                      {fmtInt(it.widthMm)} mm
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Alto</Text>
                    <Text style={styles.detailValue}>
                      {fmtInt(it.heightMm)} mm
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Material</Text>
                    <Text style={styles.detailValueBold}>
                      {materialDisplay(it.options?.material)}
                    </Text>
                  </View>

                  {showGlass && (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Vidrio</Text>
                        <Text style={styles.detailValue}>
                          {glassDisplay(it.options?.glassType)}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Color vidrio</Text>
                        <Text style={styles.detailValue}>
                          {colorDisplay(it.options?.glassColor)}
                        </Text>
                      </View>
                    </>
                  )}

                  {isCurtain && it.options?.curtainWallType && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo</Text>
                      <Text style={styles.detailValue}>
                        {it.options.curtainWallType}
                      </Text>
                    </View>
                  )}

                  {isTabBanho && it.options?.panelType && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo</Text>
                      <Text style={styles.detailValue}>
                        {it.options.panelType}
                      </Text>
                    </View>
                  )}

                  {isShower && it.options?.showerType && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo</Text>
                      <Text style={styles.detailValue}>
                        {it.options.showerType}
                      </Text>
                    </View>
                  )}

                  {isShower && it.options?.showerFrameColor && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Color marco</Text>
                      <Text style={styles.detailValue}>
                        {it.options.showerFrameColor}
                      </Text>
                    </View>
                  )}

                  {it.location && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Detalle</Text>
                      <Text style={styles.detailValueBold}>{it.location}</Text>
                    </View>
                  )}

                  {/* Pricing */}
                  <View style={styles.itemPricing}>
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Cantidad</Text>
                      <Text style={styles.pricingValue}>{fmtInt(qty)} und</Text>
                    </View>

                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Precio unitario</Text>
                      <Text style={styles.pricingValue}>{fmtMoney(unit)}</Text>
                    </View>

                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Subtotal</Text>
                      <Text style={styles.pricingTotal}>{fmtMoney(sub)}</Text>
                    </View>
                  </View>
                </View>

                {/* Imagen */}
                <View style={styles.itemImageSection}>
                  <View style={styles.itemImage}>
                    {imgSrc ? (
                      <Image src={imgSrc} style={styles.image} />
                    ) : (
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: COLORS.gray, fontSize: 9 }}>
                          Sin imagen
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Totales destacados */}
        <View style={styles.totalsContainer} break>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal (Neto)</Text>
            <Text style={styles.totalValue}>
              {fmtMoney(quote.netTotalCents)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA ({brand.IVA_PERCENT}%)</Text>
            <Text style={styles.totalValue}>{fmtMoney(quote.ivaCents)}</Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>
              {fmtMoney(quote.grandTotalCents)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {brand.COMPANY_NAME} • {brand.COMPANY_EMAIL}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Página 2: Condiciones */}
      <Page size="A4" style={styles.page}>
        <View style={styles.quoteHeader}>
          <Text style={styles.quoteTitle}>Condiciones Comerciales</Text>
        </View>

        <View style={styles.conditionsList}>
          {(
            brand.CONDITIONS ?? [
              "60% anticipo para iniciar el trabajo",
              "40% al finalizar el trabajo",
              "Precios válidos por 15 días",
              "Plazo de entrega: 20 días hábiles",
            ]
          ).map((c, i) => (
            <View key={i} style={styles.conditionItem}>
              <Text style={styles.conditionBullet}>•</Text>
              <Text style={styles.conditionText}>{c}</Text>
            </View>
          ))}
        </View>

        {/* Datos bancarios */}
        {(() => {
          const b = (brand as any).BANK || {};
          const hasBank = b.BANK_NAME || b.ACCOUNT_NUMBER;

          return hasBank ? (
            <View style={[styles.sectionCard, { marginTop: 30 }]}>
              <Text style={styles.sectionTitle}>Datos para transferencia</Text>

              {b.BANK_NAME && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Banco</Text>
                  <Text style={styles.infoValue}>{b.BANK_NAME}</Text>
                </View>
              )}

              {b.ACCOUNT_TYPE && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tipo de cuenta</Text>
                  <Text style={styles.infoValue}>{b.ACCOUNT_TYPE}</Text>
                </View>
              )}

              {b.ACCOUNT_NUMBER && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>N° de cuenta</Text>
                  <Text style={styles.infoValue}>{b.ACCOUNT_NUMBER}</Text>
                </View>
              )}

              {b.ACCOUNT_HOLDER && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Titular</Text>
                  <Text style={styles.infoValue}>{b.ACCOUNT_HOLDER}</Text>
                </View>
              )}

              {b.ACCOUNT_HOLDER_RUT && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>RUT titular</Text>
                  <Text style={styles.infoValue}>{b.ACCOUNT_HOLDER_RUT}</Text>
                </View>
              )}

              {brand.COMPANY_EMAIL && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{brand.COMPANY_EMAIL}</Text>
                </View>
              )}
            </View>
          ) : null;
        })()}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {brand.COMPANY_NAME} • {brand.COMPANY_EMAIL}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
