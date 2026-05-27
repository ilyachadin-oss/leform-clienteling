import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

// ─── Data ─────────────────────────────────────────────────────────
const periods = [
  { period:"Сен 25", месяц:1, dmКомм:483,  dmКонв:23.04, dmКонвМен:9.45,  dmВыр:17.35, pvКомм:315,  pvКонв:18.39, pvКонвМен:6.69, pvВыр:8.32  },
  { period:"Окт 25", месяц:2, dmКомм:1088, dmКонв:22.39, dmКонвМен:8.27,  dmВыр:28.18, pvКомм:925,  pvКонв:27.59, pvКонвМен:7.74, pvВыр:27.21 },
  { period:"Дек 25", месяц:4, dmКомм:2386, dmКонв:20.24, dmКонвМен:9.27,  dmВыр:47.73, pvКомм:1949, pvКонв:16.35, pvКонвМен:4.55, pvВыр:31.03 },
  { period:"Мар 26", месяц:7, dmКомм:2937, dmКонв:18.27, dmКонвМен:6.90,  dmВыр:60.46, pvКомм:2596, pvКонв:15.64, pvКонвМен:4.32, pvВыр:55.88 },
];

const convData = periods.map(p=>({
  period: p.period,
  "ДМ возврат": p.dmКонв,
  "ПВ возврат": p.pvКонв,
  "ДМ к менеджеру": p.dmКонвМен,
  "ПВ к менеджеру": p.pvКонвМен,
}));

const effData = periods.map(p=>({
  period: p.period,
  "Дмитровка": Math.round(p.dmВыр*1e6/p.dmКомм),
  "Поварская":  Math.round(p.pvВыр*1e6/p.pvКомм),
}));

const C = {
  dm:"#c9a96e", pv:"#6e9fc9",
  bg:"#0f0f0f", card:"#161616", border:"#2a2a2a",
  text:"#e8e8e8", muted:"#888",
  good:"#6fcf97", bad:"#eb5757", warn:"#f2c94c", info:"#9b8ff5",
  entry:"#7a8fa6", mid:"#5a9e8f", top:"#c9a96e", vvic:"#9b8ff5",
};

const CT = ({ active, payload, label, unit="%" }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"#1e1e1e",border:"1px solid #333",padding:"10px 14px",borderRadius:6}}>
      <p style={{color:"#aaa",marginBottom:6,fontSize:12}}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{color:p.color,margin:"2px 0",fontSize:13}}>
          {p.name}: <b>{unit==="₽"?Number(p.value).toLocaleString("ru"):p.value.toFixed(1)}{unit}</b>
        </p>
      ))}
    </div>
  );
};

// ─── VIP data ─────────────────────────────────────────────────────
const segments = [
  { id:"entry", label:"Entry VIC", range:"200-400к", clients:1976, rev:550,  interval:163, risk:90,  color:C.entry, nextLabel:"Mid",  nextThreshold:"400к", triggerZone:"320-399к", estClients:"~310",
    intervalActions:[
      {icon:"↗",label:"Сокращает <138д",color:C.good,  reaction:"Кандидат на апгрейд. Написать лично: 'До Mid — хочу показать пару вещей прежде, чем они попадут в зал'"},
      {icon:"→",label:"Норма 138-188д",  color:C.text,  reaction:"Плановые касания. Следить за приближением к 320к — включить сценарий перехода."},
      {icon:"↘",label:"Удлиняет >188д", color:C.warn,  reaction:"Ранний сигнал. Живой контакт с поводом — конкретная вещь или поставка, не шаблон."},
      {icon:"✕",label:"Молчание 90д+",  color:C.bad,   reaction:"Консультант с персональным поводом. Нет ответа 14 дней → управляющий."},
    ],
    avansPrivilege:"Приглашение на preview поставки (привилегия Mid) — до порога, как аванс для перехода",
    privileges:[
      {name:"Доставка бесплатная",   when:"D1 после покупки",       how:"Консультант упоминает как стандарт — снижает барьер онлайн-покупки"},
      {name:"Скидка 20% в ателье",   when:"D2-7 после покупки пальто/пиджака", how:"'К тому, что взяли — есть смысл подогнать. У нас ателье, вам скидка 20%'"},
      {name:"ДР в мессенджере",       when:"ДР -3 дня",              how:"Поздравление + персональная рекомендация под вкус. Не шаблон — упомянуть последнюю покупку"},
    ]},
  { id:"mid", label:"Mid VIC", range:"400-800к", clients:1114, rev:621,  interval:101, risk:60,  color:C.mid, nextLabel:"Top",  nextThreshold:"800к", triggerZone:"650-799к", estClients:"~180",
    intervalActions:[
      {icon:"↗",label:"Сокращает <86д", color:C.good,  reaction:"Кандидат в Top. Инициировать: приглашение на after-hours Top-уровня авансом."},
      {icon:"→",label:"Норма 86-116д",  color:C.text,  reaction:"Поддерживать ритм. При 650к+ — включить сценарий перехода."},
      {icon:"↘",label:"Удлиняет >116д", color:C.warn,  reaction:"Менеджер пишет лично: новинка, поставка, вещь под вкус. Если нет ответа 14д — управляющий."},
      {icon:"✕",label:"Молчание 60д+",  color:C.bad,   reaction:"Управляющий подключается: личный контакт с поводом, не 'мы скучаем'."},
    ],
    avansPrivilege:"Ранний доступ к поставке +24ч и after-hours примерка — дать почувствовать Top до порога",
    privileges:[
      {name:"Pre-presale за 5 дней",    when:"За 5 дней до сейла",    how:"'Сейл через 5 дней. Покажу вам 3 вещи до открытия' — никогда не говорить слово 'скидка'"},
      {name:"Preview поставки",          when:"До каждой поставки",    how:"'Завтра закрытый просмотр для 20 человек — хочу пригласить вас лично'"},
      {name:"Набор на ДР (игристое+свеча)", when:"День рождения",    how:"Доставка без коммерческого предложения. Это то, о чём клиент рассказывает в окружении"},
    ]},
  { id:"top", label:"Top VIC", range:"800к-2м", clients:730, rev:900,   interval:55,  risk:40,  color:C.top, nextLabel:"VVIC", nextThreshold:"2м",   triggerZone:"1.5м-1.99м", estClients:"~95",
    intervalActions:[
      {icon:"↗",label:"Сокращает <47д", color:C.good,  reaction:"Кандидат в VVIC. Управляющий лично ведёт список. Дать опыт VVIC авансом."},
      {icon:"→",label:"Норма 47-63д",   color:C.text,  reaction:"Ритм 24-36 контактов/год, 80% личных. Управляющий появляется при важных поводах."},
      {icon:"↘",label:"Удлиняет >63д",  color:C.warn,  reaction:"Управляющий пишет лично — не консультант. Правило двух ключей."},
      {icon:"✕",label:"Молчание 40д+",  color:C.bad,   reaction:"Критично. Управляющий звонит, не пишет. Каждый Top — ~1.2M выручки в год."},
    ],
    avansPrivilege:"After-hours примерка в пустом магазине + прямой запрос к байеру — до достижения 2М",
    privileges:[
      {name:"Ранний доступ +24-48ч",   when:"До каждой поставки",   how:"'Поставка завтра утром — покажу вам сегодня вечером, пока нет других'"},
      {name:"Образ к событию",           when:"При любом упоминании события", how:"Клиент сказал про ужин/переговоры → консультант предлагает подбор. Средний чек в 2х"},
      {name:"Правило двух ключей",       when:"Риск-сигнал или важный повод", how:"Управляющий появляется лично — страхует отношения при смене консультанта"},
    ]},
  { id:"vvic", label:"VVIC", range:"2м+", clients:278, rev:1136,  interval:27,  risk:25,  color:C.vvic, nextLabel:null, nextThreshold:null, triggerZone:null, estClients:null,
    intervalActions:[
      {icon:"✓",label:"Покупает в ритме",color:C.good, reaction:"100% личные касания, 40-52 в год. Управляющий участвует в ключевых точках — мероприятие, юбилей покупок."},
      {icon:"↘",label:"Немного реже",    color:C.warn, reaction:"Управляющий пишет лично. Повод — не продажа, а живой контакт: 'Давно не виделись — есть кое-что интересное'"},
      {icon:"✕",label:"Молчание 25д+",  color:C.bad,  reaction:"Service Recovery Call: управляющий звонит лично. 'Хочу убедиться, что у нас всё было в порядке в прошлый раз'. Не продающий звонок."},
      {icon:"!",label:"Не отвечает",     color:C.bad,  reaction:"50 ушедших VVIC = ~104M потерянной выручки в год. Любой ценой восстановить контакт через личный канал."},
    ],
    avansPrivilege:"Удержание — приоритет. Потеря одного VVIC = ~4М выручки за 2 года.",
    privileges:[
      {name:"After-hours по запросу",   when:"Раз в сезон + крупная поставка", how:"'Закрываемся для вас на час — спокойно всё примерите'. Конверсия близка к 100%"},
      {name:"Surprise & Delight",        when:"1 раз в год — внезапно",       how:"Клиент упомянул Италию → рекомендация ресторана. Родился ребёнок → поздравление без оффера"},
      {name:"Прямой запрос к байеру",   when:"Любой запрос на вещь 'не из зала'", how:"Консультант инициирует запрос — подтверждает уровень доступа"},
    ]},
];

export default function App() {
  const [tab, setTab] = useState("main");
  const [seg, setSeg] = useState("entry");
  const [open, setOpen] = useState(null);

  const S = segments.find(s=>s.id===seg);

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'Georgia',serif",padding:24,maxWidth:1100,margin:"0 auto"}}>

      {/* Header */}
      <div style={{marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <p style={{color:C.muted,fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>Leform · Clienteling · dthink</p>
        <h1 style={{fontSize:20,fontWeight:700,margin:0}}>Аналитика + VIP-стратегия</h1>
        <p style={{color:C.muted,fontSize:12,marginTop:3}}>Сен 2025 – Мар 2026</p>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:22,borderBottom:`1px solid ${C.border}`}}>
        {[{id:"main",label:"Данные и выводы"},{id:"vip",label:"VIP-связка"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"7px 18px",background:"transparent",border:"none",
            borderBottom:tab===t.id?`2px solid ${C.dm}`:"2px solid transparent",
            color:tab===t.id?C.text:C.muted,cursor:"pointer",
            fontSize:13,fontFamily:"inherit",fontWeight:tab===t.id?600:400,
            marginBottom:-1,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ═══ TAB 1: ДАННЫЕ И ВЫВОДЫ ═══ */}
      {tab==="main" && (
        <div>

          {/* KPI row — динамика 3 точек */}
          {(() => {
            const pts = [
              {p:"Сен 25", комм:1075, выр:30.59, конв:20.62},
              {p:"Дек 25", комм:4856, выр:86.23, конв:18.30},
              {p:"Мар 26", комм:5903, выр:119.90,конв:17.24},
            ];
            const kpis = [
              {
                label:"Коммуникаций", color:C.good, up:true,
                vals: pts.map(p=>({p:p.p, v:p.комм, display:(p.комм/1000).toFixed(1)+"K"})),
                max: 5903,
              },
              {
                label:"Выручка после касания, M₽", color:C.good, up:true,
                vals: pts.map(p=>({p:p.p, v:p.выр, display:p.выр.toFixed(1)+"M"})),
                max: 119.9,
              },
              {
                label:"Конверсия возврата, %", color:C.bad, up:false,
                vals: pts.map(p=>({p:p.p, v:p.конв, display:p.конв.toFixed(1)+"%"})),
                max: 25,
              },
            ];
            return (
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
                {kpis.map((k,ki)=>(
                  <div key={ki} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 18px"}}>
                    <p style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:0.8,marginBottom:14}}>{k.label}</p>
                    <div style={{display:"flex",gap:0,alignItems:"flex-end",marginBottom:10,height:52}}>
                      {k.vals.map((v,i)=>{
                        const barH = Math.round((v.v/k.max)*44);
                        const isLast = i===k.vals.length-1;
                        return (
                          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
                            <p style={{color:isLast?k.color:C.muted,fontSize:isLast?13:11,fontWeight:isLast?700:400,marginBottom:4,fontFamily:"monospace"}}>{v.display}</p>
                            <div style={{width:"60%",height:barH,background:isLast?k.color:k.color+"44",borderRadius:"3px 3px 0 0",minHeight:4}}/>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:6}}>
                      {k.vals.map((v,i)=>(
                        <p key={i} style={{color:C.muted,fontSize:9,textAlign:"center",flex:1}}>{v.p}</p>
                      ))}
                    </div>
                    {(() => {
                      const first = k.vals[0].v, last = k.vals[k.vals.length-1].v;
                      const diff = k.up ? ((last/first-1)*100).toFixed(0) : (last-first).toFixed(1);
                      const label = k.up ? `+${diff}% за 7 мес.` : `${diff} пп за 7 мес.`;
                      return <p style={{color:k.color,fontSize:11,fontWeight:600,marginTop:8}}>{label}</p>;
                    })()}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Charts — 2x2 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:22}}>
            {/* Chart 1: Объём коммуникаций */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
              <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:2}}>Объём коммуникаций</p>
              <p style={{color:C.muted,fontSize:11,marginBottom:12}}>×5.5 за 7 месяцев — оба магазина</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={periods.map(p=>({period:p.period,"Дмитровка":p.dmКомм,"Поварская":p.pvКомм}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="period" tick={{fill:C.muted,fontSize:10}} axisLine={false} />
                  <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} />
                  <Tooltip content={<CT unit=" шт" />} />
                  <Legend wrapperStyle={{fontSize:11}} />
                  <Line dataKey="Дмитровка" stroke={C.dm} strokeWidth={2} dot={{fill:C.dm,r:3}} />
                  <Line dataKey="Поварская"  stroke={C.pv} strokeWidth={2} dot={{fill:C.pv,r:3}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Выручка после коммуникации */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
              <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:2}}>Выручка после коммуникации, M₽</p>
              <p style={{color:C.muted,fontSize:11,marginBottom:12}}>×3.9 за 7 месяцев — деньги идут за касаниями</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={periods.map(p=>({period:p.period,"Дмитровка":p.dmВыр,"Поварская":p.pvВыр}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="period" tick={{fill:C.muted,fontSize:10}} axisLine={false} />
                  <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} />
                  <Tooltip content={<CT unit="M" />} />
                  <Legend wrapperStyle={{fontSize:11}} />
                  <Line dataKey="Дмитровка" stroke={C.dm} strokeWidth={2} dot={{fill:C.dm,r:3}} />
                  <Line dataKey="Поварская"  stroke={C.pv} strokeWidth={2} dot={{fill:C.pv,r:3}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 3: Конверсия */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
              <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:2}}>Конверсия возврата, %</p>
              <p style={{color:C.muted,fontSize:11,marginBottom:12}}>Падает — но это нормально при росте охвата</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={convData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="period" tick={{fill:C.muted,fontSize:10}} axisLine={false} />
                  <YAxis domain={[0,32]} tick={{fill:C.muted,fontSize:10}} axisLine={false} />
                  <Tooltip content={<CT unit="%" />} />
                  <Legend wrapperStyle={{fontSize:11}} />
                  <ReferenceLine y={20} stroke="#333" strokeDasharray="3 3" />
                  <Line dataKey="ДМ возврат" stroke={C.dm} strokeWidth={2} dot={{fill:C.dm,r:3}} />
                  <Line dataKey="ПВ возврат" stroke={C.pv} strokeWidth={2} dot={{fill:C.pv,r:3}} />
                  <Line dataKey="ДМ к менеджеру" stroke={C.dm} strokeWidth={1.5} dot={{fill:C.dm,r:3}} strokeDasharray="5 3" />
                  <Line dataKey="ПВ к менеджеру" stroke={C.pv} strokeWidth={1.5} dot={{fill:C.pv,r:3}} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 4: Эффективность */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
              <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:2}}>Выручка на 1 касание, ₽</p>
              <p style={{color:C.muted,fontSize:11,marginBottom:12}}>Плато ~20K с декабря — масштаб не убивает качество</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={effData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="period" tick={{fill:C.muted,fontSize:10}} axisLine={false} />
                  <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} />
                  <Tooltip content={<CT unit="₽" />} />
                  <Legend wrapperStyle={{fontSize:11}} />
                  <ReferenceLine y={20000} stroke="#444" strokeDasharray="3 3" label={{value:"плато",fill:"#555",fontSize:9}} />
                  <Line dataKey="Дмитровка" stroke={C.dm} strokeWidth={2} dot={{fill:C.dm,r:3}} />
                  <Line dataKey="Поварская"  stroke={C.pv} strokeWidth={2} dot={{fill:C.pv,r:3}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key insights */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[
              { icon:"↑", color:C.good, title:"Масштаб без деградации",
                text:"5.5x рост объёма, эффективность ~20K ₽/касание держится. Команды растут качественно." },
              { icon:"↓", color:C.bad, title:"Касания работают как реклама, не как отношения",
                text:"Конверсия к менеджеру: 8.3% → 5.7%. Клиент возвращается в магазин, но не к 'своему'. Личная связь слабее, чем нужна для VIP-сегментов." },
              { icon:"!", color:C.warn, title:"5 903 касания в месяц — всё вручную",
                text:"Ничего не автоматизировано. Это реальная нагрузка на людей. При 30 касаниях/день — минимум 8-9 менеджеров в постоянном режиме. Риск выгорания и формального выполнения плана." },
              { icon:"?", color:C.warn, title:"Поварская: октябрь 27.6% и резкое падение",
                text:"Аномальный пик в октябре, потом устойчивые 15-16%. Что произошло? Разобрать с Аней — если был рабочий инструмент, формализовать и повторить." },
            ].map((item,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${item.color}`,borderRadius:8,padding:"14px 16px",display:"flex",gap:10}}>
                <span style={{color:item.color,fontSize:16,flexShrink:0,marginTop:1}}>{item.icon}</span>
                <div>
                  <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:4}}>{item.title}</p>
                  <p style={{color:"#bbb",fontSize:12,lineHeight:1.55}}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* What to do */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
            <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:12}}>Что менять прямо сейчас</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {label:"На встрече",color:C.warn,items:["Поставить вопрос об атрибуции — растёт ли выручка реально или перетекает из зала","Обсудить автоматизацию хотя бы части Entry VIC через Mindbox: ДР, новинки, напоминания"]},
                {label:"После встречи",color:C.good,items:["Сегментировать базу по интервалам и VIP-уровням для персонализации ритма","Запустить 30-дневную цепочку для новых клиентов с чеком 100к+"]},
              ].map((col,i)=>(
                <div key={i}>
                  <p style={{color:col.color,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>{col.label}</p>
                  {col.items.map((item,j)=>(
                    <div key={j} style={{display:"flex",gap:6,marginBottom:6,alignItems:"flex-start"}}>
                      <span style={{color:col.color,fontSize:12,flexShrink:0,marginTop:1}}>→</span>
                      <p style={{color:"#ccc",fontSize:12,lineHeight:1.5}}>{item}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 2: VIP-СВЯЗКА ═══ */}
      {tab==="vip" && (
        <div>
          {/* Segment selector */}
          <div style={{display:"flex",gap:6,marginBottom:18}}>
            {segments.map(s=>(
              <button key={s.id} onClick={()=>setSeg(s.id)} style={{
                flex:1,padding:"10px 8px",background:seg===s.id?s.color+"18":"transparent",
                border:`1px solid ${seg===s.id?s.color:C.border}`,borderRadius:6,
                color:seg===s.id?s.color:C.muted,cursor:"pointer",
                fontSize:12,fontFamily:"inherit",fontWeight:seg===s.id?700:400,
                transition:"all 0.15s",textAlign:"center"
              }}>
                <p style={{margin:0}}>{s.label}</p>
                <p style={{margin:"2px 0 0",fontSize:10,opacity:0.7}}>{s.range}/год</p>
                <p style={{margin:"2px 0 0",fontSize:10,opacity:0.7}}>{s.clients.toLocaleString("ru")} клиентов</p>
              </button>
            ))}
          </div>

          {/* Segment stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
            {[
              {label:"Выручка сегмента",val:`${(S.rev/1000).toFixed(1)}B ₽`,sub:"в год"},
              {label:"Норм. интервал",  val:`${S.interval} дн.`,sub:"между покупками"},
              {label:"Риск-порог",      val:`${S.risk} дн.`,sub:"молчания → реагировать"},
              {label:"Касаний в год",   val:S.contactsYear||"40-52",sub:`${S.personalPct||100}% личных`},
            ].map((s,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${S.color}33`,borderRadius:7,padding:"12px 14px",textAlign:"center"}}>
                <p style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{s.label}</p>
                <p style={{color:S.color,fontSize:20,fontWeight:700,fontFamily:"monospace"}}>{s.val}</p>
                <p style={{color:C.muted,fontSize:10,marginTop:2}}>{s.sub}</p>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Interval behaviors */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
              <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:12}}>⏱ Интервал между покупками: что делать</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {S.intervalActions.map((a,i)=>(
                  <div key={i} style={{background:"#111",borderRadius:6,padding:"10px 12px",borderLeft:`2px solid ${a.color}`}}>
                    <div style={{display:"flex",gap:8,marginBottom:4}}>
                      <span style={{color:a.color,fontSize:14,fontWeight:700}}>{a.icon}</span>
                      <span style={{color:a.color,fontSize:12,fontWeight:600}}>{a.label}</span>
                    </div>
                    <p style={{color:"#bbb",fontSize:12,lineHeight:1.5}}>{a.reaction}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Privileges as tools */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
              <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:12}}>★ Привилегии как поводы для касания</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {S.privileges.map((p,i)=>(
                  <div key={i} style={{background:"#111",borderRadius:6,padding:"10px 12px",borderLeft:`2px solid ${S.color}`}}>
                    <p style={{color:S.color,fontSize:12,fontWeight:600,marginBottom:4}}>{p.name}</p>
                    <div style={{display:"flex",gap:6,marginBottom:4}}>
                      <span style={{color:C.warn,fontSize:10,background:C.warn+"22",padding:"1px 6px",borderRadius:2,flexShrink:0}}>{p.when}</span>
                    </div>
                    <p style={{color:"#bbb",fontSize:12,lineHeight:1.5}}>{p.how}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transition to next level */}
          {S.nextLabel && (
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:18,marginBottom:16}}>
              <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:12}}>
                → Переход в <span style={{color:segments.find(s=>s.label.includes(S.nextLabel))?.color}}>{S.nextLabel}</span>: как подтолкнуть
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                <div style={{background:"#111",borderRadius:6,padding:"12px 14px"}}>
                  <p style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Порог</p>
                  <p style={{color:C.text,fontSize:16,fontWeight:700}}>{S.nextThreshold}/год</p>
                </div>
                <div style={{background:"#111",borderRadius:6,padding:"12px 14px"}}>
                  <p style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Триггер-зона</p>
                  <p style={{color:C.warn,fontSize:13,fontWeight:600}}>{S.triggerZone}</p>
                  <p style={{color:C.muted,fontSize:11,marginTop:2}}>{S.estClients} клиентов сейчас</p>
                </div>
                <div style={{background:"#111",borderRadius:6,padding:"12px 14px"}}>
                  <p style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Окно действия</p>
                  <p style={{color:C.good,fontSize:12}}>Последние 30 дней периода — персональный контакт</p>
                </div>
              </div>
              <div style={{background:segments.find(s=>s.label.includes(S.nextLabel))?.color+"11",border:`1px solid ${segments.find(s=>s.label.includes(S.nextLabel))?.color}33`,borderRadius:6,padding:"12px 14px",marginTop:10}}>
                <p style={{color:segments.find(s=>s.label.includes(S.nextLabel))?.color,fontSize:11,fontWeight:700,marginBottom:4}}>Привилегия-аванс: дать до достижения порога</p>
                <p style={{color:C.text,fontSize:13,lineHeight:1.55}}>{S.avansPrivilege}</p>
              </div>
            </div>
          )}

          {S.id==="vvic" && (
            <div style={{background:"#1a0d1a",border:`1px solid ${C.vvic}44`,borderLeft:`3px solid ${C.vvic}`,borderRadius:8,padding:"14px 18px"}}>
              <p style={{color:C.vvic,fontSize:12,fontWeight:700,marginBottom:6}}>VVIC: логика удержания</p>
              <p style={{color:"#ccc",fontSize:13,lineHeight:1.6}}>{S.avansPrivilege}</p>
              <p style={{color:C.muted,fontSize:12,marginTop:8}}>278 клиентов = 35% всей VIC-выручки. 50 ушедших VVIC = ~104M потерянной выручки в год.</p>
            </div>
          )}

          {/* Principle */}
          <div style={{background:"#111",border:`1px solid ${C.border}`,borderRadius:8,padding:16,marginTop:16}}>
            <p style={{color:C.text,fontSize:12,fontWeight:600,marginBottom:8}}>Ключевой принцип: привилегия = повод для личного касания</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{display:"flex",gap:8}}>
                <span style={{color:C.bad,fontSize:12,flexShrink:0}}>✕</span>
                <p style={{color:C.muted,fontSize:12,lineHeight:1.5}}>Клиент накопил право на привилегию и получил её автоматически — касание не произошло, отношения не сложились.</p>
              </div>
              <div style={{display:"flex",gap:8}}>
                <span style={{color:C.good,fontSize:12,flexShrink:0}}>✓</span>
                <p style={{color:"#ccc",fontSize:12,lineHeight:1.5}}>Привилегия — повод написать лично с личным контекстом. Упомянуть последнюю покупку, дату, вкус. Только тогда это clienteling, а не CRM-рассылка.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{marginTop:22,borderTop:`1px solid ${C.border}`,paddingTop:12,display:"flex",justifyContent:"space-between"}}>
        <p style={{color:C.muted,fontSize:11}}>Данные: выгрузки 1С · Сен 2025 – Мар 2026</p>
        <p style={{color:C.muted,fontSize:11}}>Leform · dthink</p>
      </div>
    </div>
  );
}
