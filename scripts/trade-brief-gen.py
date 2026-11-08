import json, re, html, sys
from collections import defaultdict

D = json.load(open(sys.argv[1]))
OUT = sys.argv[2]

def per(s):
    m = re.search(r'€([\d,.]+)', s or '')
    return float(m.group(1).replace(',', '')) if m else None

def clean_title(t):
    # "Cohiba Cohiba Robustos" -> "Cohiba Robustos"
    w = t.split(' ')
    for n in range(1, 5):
        a, b = ' '.join(w[:n]), ' '.join(w[n:2 * n])
        if a == b:
            return ' '.join(w[n:])
    return t

NORDIC = {'SE', 'DK', 'NO', 'FI'}
CC = {'UK': 'UK', 'CH': 'Switzerland', 'DE': 'Germany', 'IE': 'Ireland', 'SE': 'Sweden'}

def rname(r):
    n = r['retailer']
    n = re.sub(r'\s*\(.*?\)\s*', ' ', n).strip()
    if r['cc'] in NORDIC:
        return 'A Swedish Habanos Specialist'
    return n

# retailer stock table
R = defaultdict(lambda: [0, 0, ''])
for x in D:
    for r in x['rows']:
        if r['live']:
            k = rname(r)
            R[k][0] += 1
            R[k][1] += (not r['soldout'])
            R[k][2] = CC.get(r['cc'], r['cc'])
live = sum(v[0] for v in R.values())
instock = sum(v[1] for v in R.values())

none, some = [], []
for x in D:
    L = [r for r in x['rows'] if r['live']]
    S = [r for r in L if not r['soldout']]
    t = clean_title(x['title'])
    if not S:
        none.append((t, x['box'], len(L)))
    else:
        ps = sorted((per(r['per']), rname(r), CC.get(r['cc'], r['cc'])) for r in S)
        some.append((t, x['box'], len(L), len(S), ps))
some.sort(key=lambda z: z[0])
none.sort()

def esc(s): return html.escape(str(s))

rows_ret = ''.join(
    f'<tr><td>{esc(k)}</td><td>{esc(v[2])}</td><td class=n>{v[0]}</td><td class=n>{v[1]}</td><td class=n>{round(100*v[1]/v[0])}%</td></tr>'
    for k, v in sorted(R.items(), key=lambda z: (-z[1][0], z[0])))

rows_some = ''.join(
    f'<tr><td>{esc(t)}</td><td class=n>{b}</td><td class=n>{s}/{l}</td><td class=n>€{p[0][0]:.2f}</td><td>{esc(p[0][1])}, {esc(p[0][2])}</td>'
    f'<td class=n>{("€%.2f" % p[-1][0]) if len(p) > 1 else "—"}</td></tr>'
    for t, b, l, s, p in some)

none_list = ''.join(f'<li>{esc(t)} <span class=m>(box of {b}; {(str(l)+" retailer"+("s" if l != 1 else "")+" read") if l else "no fresh reading"})</span></li>' for t, b, l in none)

single_uk = sum(1 for t, b, l, s, p in some if s == 1 and p[0][2] == 'UK')

page = f'''<!doctype html><html><head><meta charset=utf-8><title>Habanos Trade Brief, sample issue</title>
<style>
@page{{size:A4;margin:16mm 16mm 18mm}}
:root{{--ink:#1d1a17;--paper:#f6f1e8;--ox:#7a1f1f;--mute:#6b645b;--rule:#d8cfc0}}
body{{font:10.2pt/1.5 Georgia,"Times New Roman",serif;color:var(--ink);margin:0}}
.sans{{font-family:Helvetica,Arial,sans-serif}}
.mast{{border-bottom:2px solid var(--ink);padding-bottom:8px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:flex-end}}
.mast h1{{font-size:24pt;margin:0;letter-spacing:-.01em}}
.mast .k{{font:600 7.5pt/1.3 Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--ox)}}
.mast .r{{text-align:right;font:8pt/1.4 Helvetica,Arial,sans-serif;color:var(--mute)}}
.trade{{background:var(--ink);color:#fff;font:600 7.5pt Helvetica,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:5px 8px;margin:0 0 14px}}
h2{{font:600 8pt Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--ox);margin:18px 0 6px;border-top:1px solid var(--rule);padding-top:10px}}
.kpis{{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:6px 0 10px}}
.kpi{{border:1px solid var(--rule);padding:8px}}
.kpi b{{display:block;font-size:19pt;line-height:1.1}}
.kpi span{{font:8pt/1.3 Helvetica,Arial,sans-serif;color:var(--mute)}}
table{{width:100%;border-collapse:collapse;font:8.4pt/1.35 Helvetica,Arial,sans-serif;margin:4px 0 6px}}
th{{text-align:left;font-weight:600;border-bottom:1.5px solid var(--ink);padding:4px 5px;font-size:7.6pt;text-transform:uppercase;letter-spacing:.06em}}
td{{border-bottom:1px solid var(--rule);padding:3.5px 5px;vertical-align:top}}
.n{{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}}
th.n{{text-align:right}}
.note{{font:8pt/1.45 Helvetica,Arial,sans-serif;color:var(--mute)}}
ul.cols{{columns:2;column-gap:22px;font:8.6pt/1.5 Helvetica,Arial,sans-serif;padding-left:16px;margin:4px 0}}
.m{{color:var(--mute);font-size:7.6pt}}
.lead{{font-size:11.2pt}}
.box{{border-left:3px solid var(--ox);padding:4px 0 4px 12px;margin:10px 0}}
.brk{{page-break-before:always}}
.foot{{margin-top:16px;border-top:2px solid var(--ink);padding-top:8px;font:8pt/1.5 Helvetica,Arial,sans-serif}}
</style></head><body>

<div class=mast><div><div class=k>The Next Cigar · Markets</div><h1>Habanos Trade Brief</h1></div>
<div class=r>Sample issue · data read 8 November 2026<br>Published from Malmö, Sweden</div></div>
<p class=trade>For licensed tobacco trade only. Not for consumers. Not an offer to sell tobacco.</p>

<p class=lead><strong>The story this week is stock, not price.</strong> Prices barely moved on the week. What changed is how little is on the shelf: of {live} box prices our scraper read in the last fourteen days, <strong>{instock} were in stock ({round(100*instock/live)}%)</strong>. For {len(none)} of the 52 vitolas we track, no retailer we read had a box in stock.</p>

<div class=kpis>
<div class=kpi><b>103.1</b><span>Habanos Index, 8 Nov<br>base 100 = 10 Sep 2026</span></div>
<div class=kpi><b>−0.1%</b><span>on the week<br>+4.4% on the month</span></div>
<div class=kpi><b>{instock}/{live}</b><span>fresh box prices<br>in stock</span></div>
<div class=kpi><b>{len(none)}/52</b><span>vitolas with no box<br>in stock where we read</span></div>
</div>

<h2>1 · Nordic supply</h2>
<div class=box>
<p style="margin:0 0 6px">The Nordic Habanos importer, <strong>Elite Trading Scandinavia AB</strong> (formerly Habanos Nordic AB), lost its tobacco licence in Gothenburg on 15 December 2025. Its appeal was rejected in early summer 2026, shareholders voted for voluntary liquidation on 1 July, and Bolagsverket received the filing on 3 August. As of our last check, no successor distributor for the Nordic and Baltic markets has been publicly named.</p>
<p style="margin:0">The one Swedish Habanos Specialist we read daily showed <strong>{R["A Swedish Habanos Specialist"][1]} of {R["A Swedish Habanos Specialist"][0]}</strong> tracked boxes in stock on 8 November.</p>
</div>
<p class=note>Sources: Bolagsfakta (org. 556524-2780); Flamman, 17 Aug 2026; Cigars Connect, 4 Jun 2026.</p>

<h2>2 · Stock by retailer, last 14 days</h2>
<table><tr><th>Retailer</th><th>Country</th><th class=n>Boxes read</th><th class=n>In stock</th><th class=n>Share</th></tr>{rows_ret}</table>
<p class=note>Stock as each retailer's own page reported it when we read it. We confirmed one German "sold out" reading by hand on 8 November (Noblego: "Momentan ausverkauft, Liefertermin unbekannt"). We have not yet confirmed by hand the UK retailer that shows nearly every box in stock; treat that row as unverified.</p>

<h2 class=brk>3 · Where there is stock: cheapest in-stock box price, per cigar</h2>
<table><tr><th>Vitola</th><th class=n>Box</th><th class=n>In stock / read</th><th class=n>Cheapest</th><th>Where</th><th class=n>Dearest in stock</th></tr>{rows_some}</table>
<p class=note>{single_uk} of these {len(some)} vitolas were in stock at only one retailer, in the UK. Prices are each retailer's shelf price in its own currency, converted to euros at our reference rate, with that country's own duty and VAT included. They are not landed costs: a box crossing a border picks up destination duty and VAT.</p>

<h2>4 · No box in stock at any retailer we read</h2>
<ul class=cols>{none_list}</ul>

<h2>5 · Price movers since 10 September (same retailer, same box)</h2>
<table><tr><th>Dearer</th><th class=n>Per cigar</th><th class=n>Change</th></tr>
<tr><td>Romeo y Julieta Wide Churchills</td><td class=n>€60.69 → €71.40</td><td class=n>+17.6%</td></tr>
<tr><td>Montecristo Petit Edmundo</td><td class=n>€39.00 → €45.32</td><td class=n>+16.2%</td></tr>
<tr><td>Romeo y Julieta Short Churchills</td><td class=n>€48.88 → €55.69</td><td class=n>+13.9%</td></tr>
<tr><td>Quai d'Orsay No. 50</td><td class=n>€33.59 → €38.08</td><td class=n>+13.4%</td></tr>
<tr><td>Juan López Selección No. 1</td><td class=n>€40.22 → €44.98</td><td class=n>+11.8%</td></tr>
<tr><th>Cheaper</th><th class=n></th><th class=n></th></tr>
<tr><td>H. Upmann Connoisseur No. 1</td><td class=n>€51.50 → €47.60</td><td class=n>−7.6%</td></tr>
<tr><td>Trinidad Vigía</td><td class=n>€46.17 → €43.06</td><td class=n>−6.7%</td></tr>
<tr><td>Bolívar Belicosos Finos</td><td class=n>€56.50 → €54.74</td><td class=n>−3.1%</td></tr>
<tr><td>Cohiba Medio Siglo</td><td class=n>€66.39 → €64.47</td><td class=n>−2.9%</td></tr>
<tr><td>Partagás Serie E No. 2</td><td class=n>€80.14 → €78.54</td><td class=n>−2.0%</td></tr>
</table>
<p class=note>By brand since 10 September: Romeo y Julieta 110.6, Montecristo 105.7, Partagás 105.9, Cohiba 97.1, Trinidad 97.6 (base 100).</p>

<h2>How this is made</h2>
<p class=note>Our board lists 23 European Habanos retailers; we read their product pages up to four times a day for price, box size and whether the page says the box is in stock. In the fourteen days to 8 November, {len(R)} of them returned fresh readings. The Habanos Index is the equal-weighted average of 52 vitolas; each vitola moves only when the same retailer changes the in-stock price of the same box, so a retailer selling out does not move it. It is not Habanos S.A.'s list price and not what any one buyer pays after duty. Fourteen days or newer counts as fresh here; older readings are excluded from every table above.</p>

<div class=foot><strong>This is a sample.</strong> The full brief would arrive weekly, with every retailer named, the full 52-vitola table, Nordic stock tracked separately, and alerts when a reference comes back into stock. Reply to the email this came with if you would like it, or to tell us what you would want in it.<br>
<span class=m>The Next Cigar is an independent publication from Malmö, Sweden. We do not sell tobacco.</span></div>
</body></html>'''
open(OUT, 'w').write(page)
print(live, instock, len(none), len(some), single_uk)
