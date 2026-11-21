
/* R&M — aplicação de marketplace. Persistência no navegador; pagamentos sujeitos à confirmação externa. */
const photo=(id,w=700)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=82`;
const catalog=[
{id:1,name:'Dia de beleza + Spa completo',price:99.90,category:'Beleza & Spa',store:'Salão Mônica',img:photo('photo-1540555700478-4be289fbecef'),tag:'Mais vendido',desc:'Um momento especial de autocuidado, relaxamento e beleza.'},
{id:2,name:'Jantar romântico para dois',price:189.90,category:'Gastronomia',store:'Degustar Restaurante',img:photo('photo-1517248135467-4c7edcad34c4'),tag:'Experiência',desc:'Uma noite inesquecível com gastronomia e carinho.'},
{id:3,name:'Café da manhã especial',price:85.00,category:'Gastronomia',store:'Doce Encanto',img:photo('photo-1533089860892-a7c6f0a88666'),tag:'Surpreenda',desc:'Comece o dia de alguém com uma surpresa deliciosa.'},
{id:4,name:'Vale-compras de R$ 150',price:150,category:'Vale-compras',store:'Maura Confecções',img:photo('photo-1441986300917-64674bd600d8'),tag:'Vale-presente',desc:'Liberdade para escolher o presente perfeito.'},
{id:5,name:'Buquê de flores apaixonante',price:119.90,category:'Flores & Presentes',store:'Flor de Mel',img:photo('photo-1525310072745-f49212b5ac6d'),tag:'Romântico',desc:'Flores selecionadas para encantar.'},
{id:6,name:'Massagem relaxante premium',price:129.90,category:'Beleza & Spa',store:'Salão Mônica',img:photo('photo-1519823551278-64ac92734fb1'),tag:'Bem-estar',desc:'Uma pausa merecida para renovar as energias.'},
{id:7,name:'Experiência hambúrguer em dupla',price:79.90,category:'Gastronomia',store:'Burguer House',img:photo('photo-1568901346375-23c9450c58cd'),tag:'Para compartilhar',desc:'Sabores especiais para curtir a dois.'},
{id:8,name:'Vale-compras de R$ 100',price:100,category:'Vale-compras',store:'Maura Confecções',img:photo('photo-1483985988355-763728e1935b'),tag:'Escolha livre',desc:'Um presente prático, versátil e cheio de possibilidades.'},
{id:9,name:'Ensaio fotográfico especial',price:249.90,category:'Experiências',store:'Luz Studio',img:photo('photo-1542038784456-1ea8e935640e'),tag:'Memórias',desc:'Transforme momentos em lembranças para sempre.'},
{id:10,name:'Box de chocolates finos',price:69.90,category:'Flores & Presentes',store:'Doce Encanto',img:photo('photo-1511381939415-e44015466834'),tag:'Doçura',desc:'Uma seleção deliciosa para quem merece carinho.'},
{id:11,name:'Almoço especial para dois',price:129.90,category:'Gastronomia',store:'Degustar Restaurante',img:photo('photo-1414235077428-338989a2e8c0'),tag:'Momentos',desc:'Uma experiência gastronômica para compartilhar.'},
{id:12,name:'Vale beleza e autocuidado',price:180,category:'Beleza & Spa',store:'Salão Mônica',img:photo('photo-1560066984-138dadb4c035'),tag:'Exclusivo',desc:'Um presente para se sentir ainda mais especial.'}
];
const storeNames=[...new Set(catalog.map(x=>x.store))];const icons={'Gastronomia':'fa-utensils','Beleza & Spa':'fa-spa','Vale-compras':'fa-bag-shopping','Flores & Presentes':'fa-gift','Experiências':'fa-camera','Todos':'fa-border-all'};
const initialCompanies=Object.fromEntries(storeNames.map((s,i)=>[s,{name:s,phone:'',pix:'',address:'Uruçuí, Piauí',description:'Experiências especiais para presentear quem você ama.',logo:'',verified:true}]));
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem('rm_'+k))??f}catch{return f}};const save=(k,v)=>localStorage.setItem('rm_'+k,JSON.stringify(v));
let users=read('users',[]),orders=read('orders',[]),companies=read('companies',initialCompanies),session=read('session',null),page='home',filter='Todos',searchTerm='',selected=null,checkoutMethod='pix',checkoutStep=0,selectedStore=storeNames[0],dashTab='overview',pendingAction=null,slide=0;
const money=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const uid=()=>crypto.randomUUID?.()||('rm'+Date.now()+Math.random().toString(36).slice(2));const currentUser=()=>users.find(x=>x.id===session?.id);const myOrders=()=>orders.filter(x=>x.userId===session?.id);let prod=id=>catalog.find(x=>x.id===Number(id));const company=s=>companies[s]||initialCompanies[s];const shuffle=a=>[...a].sort(()=>Math.random()-.5);
function toast(t){document.getElementById('toast-root').innerHTML=`<div class="toast">${safe(t)}</div>`;setTimeout(()=>document.getElementById('toast-root').innerHTML='',3200)}
function navigate(p){page=p;filter='Todos';searchTerm='';closeModal();render();scrollTo(0,0)}
function render(){const app=document.getElementById('app');app.innerHTML=`<div class="topbar"><i class="fa-solid fa-heart"></i> Presentes que surpreendem. Momentos que ficam. <i class="fa-solid fa-heart"></i></div><header class="header"><div class="container header-main"><a class="logo" href="#" onclick="navigate('home');return false">R<span>&</span>M<small>EXPERIÊNCIAS & PRESENTES</small></a><div class="search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="Busque experiências, presentes e lojas..." value="${safe(searchTerm)}" oninput="searchTerm=this.value;page='home';renderProducts()" onkeydown="if(event.key==='Enter')document.getElementById('products-area')?.scrollIntoView({behavior:'smooth'})"></div><div class="head-actions"><button class="action" onclick="navigate('orders')"><i class="fa-solid fa-receipt"></i><span>Meus pedidos</span></button><button class="action" onclick="navigate('company')"><i class="fa-solid fa-store"></i><span>Minha empresa</span></button><button class="action" onclick="${session?"navigate('account')":"showAuth()"}"><i class="fa-regular fa-circle-user"></i><span>${session?'Minha conta':'Entrar / Cadastrar'}</span></button></div></div><nav class="nav container"><button onclick="navigate('home')">Início</button><button onclick="setFilter('Gastronomia')">Gastronomia</button><button onclick="setFilter('Beleza & Spa')">Beleza & Spa</button><button onclick="setFilter('Vale-compras')">Vale-compras</button><button onclick="setFilter('Flores & Presentes')">Presentes</button><button onclick="navigate('stores')">Lojas parceiras</button><button class="location" onclick="toast('Disponível em Uruçuí - PI')"><i class="fa-solid fa-location-dot"></i> Piauí · Uruçuí <i class="fa-solid fa-chevron-down"></i></button></nav></header><main class="container">${page==='home'?home():page==='orders'?ordersPage():page==='company'?companyPage():page==='account'?accountPage():page==='stores'?storesPage():page==='store'?storePage():''}</main>${footer()}<div class="mobile-nav"><button onclick="navigate('home')"><i class="fa-solid fa-house"></i>Início</button><button onclick="navigate('stores')"><i class="fa-solid fa-compass"></i>Explorar</button><button onclick="navigate('orders')"><i class="fa-solid fa-gift"></i>Pedidos</button><button onclick="navigate('company')"><i class="fa-solid fa-store"></i>Empresa</button><button onclick="${session?"navigate('account')":"showAuth()"}"><i class="fa-regular fa-user"></i>Conta</button></div>`;if(page==='home')renderProducts()}
function home(){return `<section class="hero"><div class="hero-grid"><div class="hero-main"><img src="${photo('photo-1513201099705-a9746e1e201f',850)}"><div class="hero-content"><span class="eyebrow"> O jeito mais especial de presentear</span><h1>Presentear é criar memórias.</h1><p>Surpreenda quem você ama com experiências únicas e vales-presente em Uruçuí.</p><button class="btn btn-white" onclick="document.getElementById('products-area').scrollIntoView({behavior:'smooth'})">Encontrar o presente ideal <i class="fa-solid fa-arrow-right"></i></button></div></div><div class="hero-side"><div class="side-banner"><img src="${photo('photo-1540555700478-4be289fbecef',500)}"><div><span class="mini">MOMENTOS DE CUIDADO</span><strong>Um carinho só para você</strong><p>Experiências de beleza e spa</p></div></div><div class="side-banner"><img src="${photo('photo-1517248135467-4c7edcad34c4',500)}"><div><span class="mini">SURPREENDA COM SABOR</span><strong>Experiências inesquecíveis</strong><p>Gastronomia para compartilhar</p></div></div></div></div></section><div class="benefits"><div class="benefit"><i class="fa-solid fa-gift"></i><div><strong>Presenteie online</strong><span>Sem sair de casa</span></div></div><div class="benefit"><i class="fa-solid fa-ticket"></i><div><strong>Voucher exclusivo</strong><span>Um presente só seu</span></div></div><div class="benefit"><i class="fa-solid fa-store"></i><div><strong>Comércio local</strong><span>Valorize Uruçuí</span></div></div><div class="benefit"><i class="fa-solid fa-heart"></i><div><strong>Feito com carinho</strong><span>Surpresas inesquecíveis</span></div></div></div><section class="section"><div class="section-head"><div><h2>Qual momento você quer presentear? </h2><p>Escolha uma categoria e encontre a surpresa perfeita.</p></div></div><div class="categories">${Object.keys(icons).filter(x=>x!=='Todos').concat('Todos').map(c=>`<button class="cat ${filter===c?'active':''}" onclick="setFilter('${c}')"><div class="cat-icon"><i class="fa-solid ${icons[c]}"></i></div><strong>${c}</strong><small>Ver opções</small></button>`).join('')}</div></section><section class="section" id="products-area"><div class="section-head"><div><h2>Presentes para encantar </h2><p>Descubra experiências e mimos das nossas lojas parceiras.</p></div><button class="text-link" onclick="setFilter('Todos')">Ver todos <i class="fa-solid fa-arrow-right"></i></button></div><div class="products" id="product-grid"></div></section><div class="wide-promo"><div><h2>Um presente. Mil sentimentos. </h2><p>Escolha, presenteie e faça alguém sorrir. Simples assim.</p></div><button class="btn btn-white" onclick="document.getElementById('products-area').scrollIntoView({behavior:'smooth'})">Escolher presente <i class="fa-solid fa-arrow-right"></i></button></div><section class="section"><div class="section-head"><div><h2>Parceiros que fazem acontecer</h2><p>Conheça os negócios que tornam cada presente possível.</p></div><button class="text-link" onclick="navigate('stores')">Todas as lojas</button></div><div class="categories">${storeNames.slice(0,6).map(s=>`<button class="cat" onclick="openStore('${safe(s)}')"><div class="cat-icon"><i class="fa-solid fa-store"></i></div><strong>${safe(s)}</strong><small><i class="fa-solid fa-circle-check" style="color:#19a5bf"></i> Parceira</small></button>`).join('')}</div></section>`}
function renderProducts(){const g=document.getElementById('product-grid');if(!g)return;let list=shuffle(catalog.filter(x=>(filter==='Todos'||x.category===filter)&&(`${x.name} ${x.store} ${x.category}`.toLowerCase().includes(searchTerm.toLowerCase()))));g.innerHTML=list.length?list.map(productCard).join(''):'<div class="empty">Nenhum presente encontrado. Experimente outra busca.</div>'}
function productCard(p){return `<article class="product" onclick="showProduct(${p.id})"><div class="product-photo"><img loading="lazy" src="${p.img}" alt="${safe(p.name)}"><span class="tag">${safe(p.tag)}</span></div><div class="product-body"><div class="store"><span class="store-avatar">${safe(p.store[0])}</span>${safe(p.store)} <i class="fa-solid fa-circle-check"></i></div><h3>${safe(p.name)}</h3><div class="rating"> <span>(4,9) · Uruçuí</span></div><div class="price">${money(p.price)}<small>Presente digital · Resgate na loja</small></div><button class="btn" onclick="event.stopPropagation();showProduct(${p.id})"><i class="fa-solid fa-gift"></i> Presentear agora</button></div></article>`}
function toggleFav(id){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];save('favorites',favorites);renderProducts();toast('Lista de favoritos atualizada')}
function setFilter(c){page='home';filter=c;render();document.getElementById('products-area')?.scrollIntoView({behavior:'smooth'})}
function footer(){return `<footer class="footer"><div class="container"><div class="footer-grid"><div><div class="logo">R<span>&</span>M<small>EXPERIÊNCIAS & PRESENTES</small></div><p>Conectando pessoas por meio de presentes especiais e experiências que se transformam em lembranças.</p></div><div><h4>Explore</h4><a href="#" onclick="navigate('home');return false">Início</a><a href="#" onclick="navigate('stores');return false">Lojas parceiras</a><a href="#" onclick="navigate('orders');return false">Meus pedidos</a></div><div><h4>Para empresas</h4><a href="#" onclick="navigate('company');return false">Painel da empresa</a><a href="#" onclick="navigate('company');return false">Gerenciar pedidos</a></div><div><h4>Atendimento</h4><p><i class="fa-solid fa-location-dot"></i> Uruçuí, Piauí<br><i class="fa-regular fa-envelope"></i> Atendimento digital</p></div></div><div class="copyright"><span>© 2026 R&M. Feito para aproximar pessoas.</span><span>Presentear é viver.</span></div></div></footer>`}
function modal(html,wide=false){document.getElementById('modal-root').innerHTML=`<div class="modal-back" onclick="if(event.target===this)closeModal()"><div class="modal ${wide?'wide':''}"><button class="close" onclick="closeModal()">×</button>${html}</div></div>`}function closeModal(){document.getElementById('modal-root').innerHTML=''}
function showProduct(id){let p=prod(id);modal(`<img class="detail-img" src="${p.img}"><span class="store"><i class="fa-solid fa-circle-check"></i> ${safe(p.store)} · Uruçuí/PI</span><h2 style="margin-top:12px">${safe(p.name)}</h2><p>${safe(p.desc)}</p><div class="price">${money(p.price)}</div><div class="demo">O voucher poderá ser enviado após a aprovação da loja parceira.</div><button class="btn" style="width:100%" onclick="showProduct(${p.id})"><i class="fa-solid fa-gift"></i> Presentear agora</button><button class="btn btn-outline" style="width:100%" onclick="openStore('${safe(p.store)}')">Conhecer a loja</button>`)}
function showAuth(register=false){modal(`<h2>${register?'Crie sua conta':'Bem-vindo à R&M '}</h2><p>${register?'Preencha seus dados para continuar sua experiência.':'Entre para acompanhar seus pedidos e surpreender quem você ama.'}</p><form onsubmit="authSubmit(event,${register})">${register?`<div class="field"><label>Nome completo</label><input name="name" required></div><div class="form-grid"><div class="field"><label>CPF</label><input name="cpf" maxlength="14" required placeholder="000.000.000-00"></div><div class="field"><label>Endereço</label><input name="address" required placeholder="Rua, número e bairro"></div></div>`:''}<div class="field"><label>E-mail</label><input name="email" type="email" required></div><div class="field"><label>Senha</label><input name="password" type="password" minlength="6" required></div><button class="btn" style="width:100%">${register?'Criar conta e continuar':'Entrar na minha conta'}</button></form><button class="text-link" style="margin-top:17px" onclick="showAuth(${!register})">${register?'Já tenho uma conta. Entrar':'Não tem conta? Cadastre-se grátis'}</button><div class="demo">Proteja seus dados de acesso. As informações desta sessão são armazenadas neste navegador.</div>`)}
function authSubmit(e,register){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(register){if(users.some(u=>u.email.toLowerCase()===d.email.toLowerCase()))return toast('Este e-mail já está cadastrado');if(!/^\d{11}$/.test(d.cpf.replace(/\D/g,'')))return toast('Informe um CPF com 11 dígitos');let u={id:uid(),name:d.name,email:d.email,cpf:d.cpf,address:d.address,password:d.password};users.push(u);save('users',users);session={id:u.id};}else{let u=users.find(x=>x.email.toLowerCase()===d.email.toLowerCase()&&x.password===d.password);if(!u)return toast('E-mail ou senha incorretos');session={id:u.id}}save('session',session);closeModal();if(pendingAction?.type==='checkout'){const id=pendingAction.id;pendingAction=null;startCheckout(id)}else navigate('account');toast('Que bom ter você aqui!')}
function startCheckout(id){if(!session){pendingAction={type:'checkout',id};return showAuth()}selected=id;checkoutMethod='pix';checkoutStep=0;checkoutRender()}
function checkoutRender(){const p=prod(selected),c=company(p.store);if(checkoutStep===0){modal(`<h2>Finalizar presente </h2><p>Escolha como deseja realizar o pagamento.</p><div class="order-card"><img src="${p.img}"><div class="order-info"><h3>${safe(p.name)}</h3><p>${safe(p.store)}</p><strong>${money(p.price)}</strong></div></div><div class="pay-choice ${checkoutMethod==='pix'?'selected':''}" onclick="checkoutMethod='pix';checkoutRender()"><i class="fa-brands fa-pix" style="font-size:23px;color:#2baea5"></i><div><strong>Pix</strong><small>Pagamento direto à empresa parceira</small></div></div><div class="pay-choice ${checkoutMethod==='cash'?'selected':''}" onclick="checkoutMethod='cash';checkoutRender()"><i class="fa-solid fa-store" style="font-size:21px"></i><div><strong>Pagamento presencial</strong><small>À vista ou cartão de crédito na loja</small></div></div>${checkoutMethod==='cash'?`<div class="field"><label>Como deseja pagar?</label><select id="pay-detail"><option value="À vista">À vista</option><option value="Cartão de crédito">Cartão de crédito</option></select></div>`:''}<button class="btn" style="width:100%" onclick="continueCheckout()">Continuar <i class="fa-solid fa-arrow-right"></i></button><div class="demo">Confira as informações de pagamento disponibilizadas pela empresa antes de prosseguir.</div>`)}else if(checkoutStep===1){modal(`<h2>Pagamento via Pix</h2><p>Realize o pagamento diretamente para a empresa parceira.</p><div class="voucher-preview"><i class="fa-brands fa-pix" style="font-size:40px;color:#2da99e"></i><h2>${money(p.price)}</h2><p>${safe(p.store)}</p><div class="summary" style="overflow-wrap:anywhere;text-align:left">Chave Pix: <strong>${safe(c.pix||'Não cadastrada')}</strong></div></div>${c.pix?`<button class="btn btn-outline" style="width:100%" onclick="copyText('${safe(c.pix)}')">Copiar chave Pix</button>`:''}<div class="demo">Confira os dados de pagamento diretamente com a loja. Ao continuar, você informa que realizou o pagamento, sujeito à confirmação pela empresa.</div><button class="btn" style="width:100%" onclick="checkoutStep=2;checkoutRender()">Já realizei o pagamento</button><button class="btn btn-outline" style="width:100%" onclick="checkoutStep=0;checkoutMethod='cash';checkoutRender()">Escolher pagamento presencial</button>`)}else{modal(`<h2>Confirme seu pedido </h2><p>Confira os dados antes de enviar a solicitação.</p><div class="summary">Presente <b>${safe(p.name)}</b><br>Loja <b>${safe(p.store)}</b><br>Pagamento <b>${checkoutMethod==='pix'?'Pix (declarado pelo comprador)':safe(window.payDetail||'Presencial')}</b><br>Total <b>${money(p.price)}</b></div><div class="demo">Seu pedido será registrado como <b>aguardando aprovação</b>. A empresa deve aprová-lo antes de liberar o voucher. O WhatsApp abrirá com a mensagem pronta.</div><button class="btn" style="width:100%" onclick="submitOrder()">Solicitar pedido <i class="fa-brands fa-whatsapp"></i></button>`)} }
function continueCheckout(){if(checkoutMethod==='cash'){window.payDetail=document.getElementById('pay-detail').value;checkoutStep=2}else checkoutStep=1;checkoutRender()}
function submitOrder(){const p=prod(selected),u=currentUser(),o={id:uid(),number:'RM-'+Date.now().toString().slice(-8),userId:u.id,productId:p.id,store:p.store,price:p.price,payment:checkoutMethod==='pix'?'Pix (declarado)':window.payDetail||'Presencial',status:'pending',created:new Date().toISOString(),recipient:null,voucher:null};orders.unshift(o);save('orders',orders);closeModal();navigate('orders');toast('Pedido registrado! Aguardando aprovação.');let msg=`Olá, ${p.store}! Gostaria de solicitar este pedido R&M.\n\nPedido: ${o.number}\nCliente: ${u.name}\nProduto: ${p.name}\nValor: ${money(p.price)}\nPagamento: ${o.payment}\nStatus: Aguardando aprovação.\n\nPor favor, confirme a disponibilidade.`;let phone=(company(p.store).phone||'').replace(/\D/g,'');if(phone){window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank')}else{copyText(msg);toast('Pedido criado! Mensagem copiada: configure o WhatsApp da loja no painel.')}}
function ordersPage(){if(!session)return `<div class="page"><h1 class="page-title">Meus pedidos </h1><div class="panel empty"><i class="fa-regular fa-user"></i><h3>Entre para acompanhar seus presentes</h3><button class="btn" onclick="showAuth()">Entrar ou criar conta</button></div></div>`;let list=myOrders();return `<div class="page"><h1 class="page-title">Meus pedidos </h1><p class="subtitle">Acompanhe cada surpresa, do pedido ao resgate.</p>${list.length?list.map(o=>{let p=prod(o.productId);return `<div class="order-card" style="background:white"><img src="${p.img}"><div class="order-info"><span class="status ${o.status==='pending'?'':o.status==='redeemed'?'redeemed':'approved'}">${statusText(o.status)}</span><h3>${safe(p.name)}</h3><p>${safe(o.store)} · ${safe(o.number)} · ${new Date(o.created).toLocaleDateString('pt-BR')}</p><strong>${money(o.price)}</strong><div class="order-actions">${o.status==='approved'&&!o.recipient?`<button class="btn btn-small" onclick="recipientModal('${o.id}')">Enviar presente <i class="fa-solid fa-paper-plane"></i></button>`:''}${o.recipient?`<button class="btn btn-small" onclick="downloadVoucher('${o.id}')"><i class="fa-solid fa-download"></i> Baixar voucher</button><button class="btn btn-outline btn-small" onclick="copyGift('${o.id}')">Copiar mensagem</button>`:''}</div></div></div>`}).join(''):`<div class="panel empty"><i class="fa-solid fa-gift"></i><h3>Ainda não há pedidos</h3><p>O presente perfeito está esperando por você!</p><button class="btn" onclick="navigate('home')">Explorar presentes</button></div>`}</div>`}
function statusText(s){return ({pending:'Aguardando aprovação',approved:'Aprovado · Pronto para presentear',redeemed:'Presente resgatado',rejected:'Pedido recusado'})[s]||s}
function recipientModal(id){const o=orders.find(x=>x.id===id);if(o.status!=='approved'||o.recipient)return toast('Presente indisponível para envio');modal(`<h2>Para quem vai este presente? </h2><p>Preencha com atenção. Depois de salvar, os dados não poderão ser alterados.</p><form onsubmit="saveRecipient(event,'${id}')"><div class="field"><label>Nome completo de quem vai receber</label><input name="name" required></div><div class="field"><label>WhatsApp com DDD</label><input name="phone" required minlength="10" placeholder="(89) 99999-9999"></div><div class="field"><label>Mensagem especial (opcional)</label><textarea name="message" rows="3" placeholder="Escreva uma mensagem com carinho..."></textarea></div><button class="btn" style="width:100%">Salvar e gerar voucher exclusivo</button></form>`)}
function saveRecipient(e,id){e.preventDefault();const o=orders.find(x=>x.id===id);if(!o||o.status!=='approved'||o.recipient)return toast('Operação não permitida');const d=Object.fromEntries(new FormData(e.target));if(d.phone.replace(/\D/g,'').length<10)return toast('Informe um WhatsApp válido');o.recipient={name:d.name,phone:d.phone,message:d.message};o.voucher='RMV-'+uid().replace(/-/g,'').slice(0,12).toUpperCase();save('orders',orders);closeModal();render();toast('Voucher gerado com sucesso!')}
function giftMessage(o){return ` SURPRESA! ${currentUser()?.name||'Alguém especial'} presenteou ${o.recipient.name} com ${prod(o.productId).name}! \n\nLoja: ${o.store}\nVoucher: ${o.voucher}\n${o.recipient.message?'Mensagem: '+o.recipient.message+'\n':''}\nApresente o voucher na loja para resgatar sua experiência. Aproveite!`}
function copyText(t){navigator.clipboard?.writeText(t).then(()=>toast('Copiado!')).catch(()=>toast('Não foi possível copiar automaticamente'))}function copyGift(id){const o=orders.find(x=>x.id===id);if(o?.recipient)copyText(giftMessage(o))}
function downloadVoucher(id){const o=orders.find(x=>x.id===id);if(!o?.recipient)return;const p=prod(o.productId);let html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Voucher ${safe(o.voucher)}</title><style>body{font-family:Arial,sans-serif;background:#f9f1f4;margin:0;padding:25px;color:#342337}.card{max-width:480px;margin:35px auto;background:white;border-radius:24px;padding:35px;text-align:center;box-shadow:0 15px 50px #0001}h1{color:#ed3350;font-size:42px;margin:0}h2{font-size:28px}.code{background:#fff0f3;padding:15px;border-radius:12px;font-size:22px;font-weight:bold;letter-spacing:2px;overflow-wrap:anywhere}.note{color:#777;line-height:1.7;font-size:14px}.badge{color:#a61b40;font-weight:bold}button{padding:12px 22px;border:0;background:#ed3350;color:white;border-radius:10px;cursor:pointer}@media print{button{display:none}}
/* R&M editorial commerce refresh */
:root{--red:#b73d4e;--deep:#852e3e;--ink:#292a30;--muted:#777983;--bg:#f7f7f5;--line:#e9e8e5;--shadow:0 12px 35px #2424240b}body{letter-spacing:-.1px}.topbar{background:#292a30}.header{box-shadow:none}.logo{letter-spacing:-1.5px}.hero-main{background:#6b343d;border-radius:10px}.hero-main:after{content:''}.hero-main img{mask-image:linear-gradient(to right,transparent,black 45%)}.side-banner,.product,.panel,.store-hero,.benefit,.cat,.modal,.wide-promo{border-radius:10px}.btn{border-radius:7px}.product{box-shadow:none}.product-photo{height:210px}.product:hover{transform:none;box-shadow:0 9px 25px #0000000d}.section-head h2{font-size:27px}.editorial-kicker{color:var(--red);text-transform:uppercase;font-size:10px;font-weight:800;letter-spacing:2px;margin-bottom:8px}.city-strip{display:flex;align-items:center;gap:15px;justify-content:space-between;padding:17px 22px;background:#fff;border:1px solid var(--line);border-radius:9px;margin:20px 0}.city-strip p{margin:4px 0 0;color:var(--muted);font-size:12px}.city-strip strong{font-size:14px}.city-strip button{white-space:nowrap}.welcome{background:#fff;border:1px solid var(--line);padding:23px 25px;border-radius:10px;display:flex;gap:20px;align-items:center;justify-content:space-between;margin:24px 0}.welcome h2{font:800 23px Outfit;margin:4px 0}.welcome p{font-size:13px;color:var(--muted);max-width:680px;line-height:1.6;margin:5px 0}.welcome-actions{display:flex;gap:8px;align-items:center}.plain-x{border:0;background:none;font-size:20px;color:#888}.type-nav{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:26px 0}.type-nav button{background:#fff;border:1px solid var(--line);border-radius:9px;padding:21px;text-align:left;display:flex;align-items:center;gap:14px;font-size:15px;font-weight:800;color:var(--ink)}.type-nav i{font-size:20px;color:var(--red)}.type-nav button:hover{border-color:var(--red)}.shelf{margin:38px 0}.shelf-track{display:flex;gap:15px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:12px}.shelf-track::-webkit-scrollbar{display:none}.shelf-track>.product{min-width:245px;width:245px;scroll-snap-align:start;flex-shrink:0}.shelf-tools{display:flex;gap:8px}.arrow-btn{border:1px solid var(--line);background:#fff;border-radius:7px;width:34px;height:34px}.list-product{display:grid;grid-template-columns:190px 1fr auto;gap:20px;padding:14px;background:white;border:1px solid var(--line);border-radius:9px;margin-bottom:12px;align-items:center}.list-product img{width:190px;height:145px;object-fit:cover;border-radius:6px}.list-product h3{font-size:18px;margin:8px 0}.list-product p{color:var(--muted);font-size:12px}.list-product .price{font-size:23px}.list-product .btn{white-space:nowrap}.store-track{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:10px;scrollbar-width:none}.store-tile{min-width:220px;flex:0 0 220px;background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden;text-align:left;cursor:pointer}.store-cover{height:95px;background:#e7e0dc;overflow:hidden}.store-cover img{width:100%;height:100%;object-fit:cover}.store-logo{width:60px;height:60px;display:grid;place-items:center;border-radius:12px;background:white;border:3px solid white;box-shadow:0 3px 15px #0002;margin:-29px 0 0 15px;position:relative;overflow:hidden;font:800 23px Outfit;color:var(--red)}.store-logo img{width:100%;height:100%;object-fit:contain}.store-tile-body{padding:9px 15px 17px}.store-tile-body strong{display:block;font-size:14px}.store-tile-body small{font-size:11px;color:var(--muted)}.store-profile{background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden;margin-bottom:30px}.store-profile-cover{height:220px;overflow:hidden;background:#ddd}.store-profile-cover img{width:100%;height:100%;object-fit:cover}.store-profile-body{display:flex;gap:20px;align-items:center;padding:0 26px 24px}.store-profile-body .store-logo{margin-top:-32px;flex-shrink:0;width:88px;height:88px;font-size:31px}.store-profile-body h1{font:800 29px Outfit;margin:10px 0 4px}.store-profile-body p{font-size:12px;color:var(--muted);margin:5px 0}.settings-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}.settings-tabs button{border:1px solid var(--line);background:white;border-radius:7px;padding:10px 14px;font-weight:700;font-size:12px}.settings-tabs button.active{background:var(--ink);color:white}.check-line{display:flex;gap:10px;align-items:center;font-size:13px;margin:13px 0}.check-line input{width:17px;height:17px}.city-modal-option{width:100%;padding:14px;border:1px solid var(--line);background:#fff;border-radius:8px;text-align:left;margin-top:10px}.muted-note{font-size:11px;color:var(--muted);line-height:1.6}.section-head .text-link{margin-left:auto}.section-head .shelf-tools{margin-left:12px}@media(max-width:650px){.welcome,.city-strip{align-items:flex-start;flex-direction:column;padding:17px}.welcome-actions{width:100%}.type-nav{gap:7px}.type-nav button{padding:14px 7px;flex-direction:column;align-items:flex-start;font-size:11px;gap:10px}.type-nav i{font-size:18px}.shelf-track>.product{min-width:205px;width:205px}.shelf-track .product-photo{height:145px}.list-product{grid-template-columns:100px 1fr;gap:11px;align-items:start}.list-product img{width:100px;height:115px}.list-product h3{font-size:14px}.list-product .list-actions{grid-column:2}.list-product .price{font-size:19px}.store-profile-cover{height:145px}.store-profile-body{padding:0 15px 18px;gap:10px}.store-profile-body h1{font-size:22px}.store-profile-body .store-logo{width:68px;height:68px}.store-tile{min-width:180px;flex-basis:180px}.section-head h2{font-size:22px}}
</style><style>
.hero-grid{display:block}.hero-side{display:none}.hero-main{min-height:390px}.hero-dots{display:flex;gap:7px;position:absolute;bottom:18px;left:45px;z-index:5}.hero-dots button{width:24px;height:5px;border:0;border-radius:4px;background:#ffffff80}.hero-dots button.active{background:white;width:42px}.product{min-width:0}.product h3{min-height:42px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.product-body{display:flex;flex-direction:column;min-height:215px}.product-body .price{margin-top:auto}.listing-row{display:grid;grid-template-columns:170px minmax(0,1fr) auto;align-items:center;gap:18px;border:1px solid var(--line);background:white;padding:13px;border-radius:12px;margin-bottom:12px}.listing-row img{width:170px;height:125px;object-fit:cover;border-radius:8px}.listing-row h3{margin:6px 0;font-size:17px}.listing-row p{font-size:12px;color:var(--muted)}.listing-row .btn{white-space:nowrap}.detail-layout{display:grid;grid-template-columns:1.1fr 1fr;gap:24px}.detail-layout img{width:100%;height:400px;object-fit:cover;border-radius:13px}.detail-layout h2{font-size:30px}.welcome-overlay{position:fixed;inset:0;background:#17171c99;display:grid;place-items:center;z-index:110;padding:18px}.welcome-card{background:#fff;border-radius:17px;width:min(480px,100%);padding:36px;position:relative;box-shadow:0 22px 80px #0002}.welcome-card h2{font:800 31px Outfit;line-height:1.12}.welcome-card .close{right:15px;top:15px}.cookie-banner{position:fixed;bottom:15px;left:15px;right:15px;z-index:105;max-width:800px;margin:auto;background:#fff;border:1px solid var(--line);box-shadow:0 15px 55px #0002;border-radius:12px;padding:17px;display:flex;align-items:center;gap:20px}.cookie-banner p{font-size:12px;flex:1;line-height:1.6}.merchant-cta{padding:40px;border-radius:13px;background:#292a30;color:white;display:flex;align-items:center;justify-content:space-between;gap:20px;margin:35px 0}.merchant-cta p{color:#ddd;font-size:13px}.merchant-cta h2{font:800 28px Outfit}.upload-preview{width:76px;height:76px;object-fit:contain;border:1px solid var(--line);border-radius:12px}.manage-item{display:flex;gap:14px;align-items:center;border-bottom:1px solid var(--line);padding:12px 0}.manage-item img{width:74px;height:68px;object-fit:cover;border-radius:8px}.manage-item>div{flex:1}.manage-item strong{font-size:13px}.manage-item small{display:block;color:#888}.form-grid .field{min-width:0}@media(max-width:650px){.hero-main{min-height:325px}.hero-dots{left:20px}.listing-row{grid-template-columns:104px 1fr;gap:10px}.listing-row img{width:104px;height:112px}.listing-row .btn{grid-column:1/-1;width:100%}.listing-row h3{font-size:14px}.detail-layout{grid-template-columns:1fr}.detail-layout img{height:245px}.cookie-banner{bottom:76px;flex-wrap:wrap}.cookie-banner .btn{flex:1}.merchant-cta{display:block;padding:25px}.welcome-card{padding:25px}}
</style><style>
/* R&M v7: mobile-first merchant workspace and quiet campaign photography */
.rm-hero-photo{position:relative;aspect-ratio:2.65/1;overflow:hidden;background:#e6e0d9}.rm-hero-photo img{display:block;width:100%;height:100%;object-fit:cover}.rm-hero-photo .hero-dots{left:24px;bottom:20px}.rm-hero-photo .hero-dots button{box-shadow:0 1px 8px #0006}.rm-card-likes{display:flex;gap:13px;align-items:center;font-size:11px;color:#736a68;margin:11px 0 12px}.rm-card-likes i{color:#a43748;font-size:14px}.rm-card-likes .negative i{color:#6b6872}.rm-notification{position:relative;display:inline-flex}.rm-notification em{position:absolute;top:-10px;right:-12px;background:#b4384d;color:#fff;font-style:normal;font-size:10px;min-width:18px;height:18px;display:grid;place-items:center;padding:0 4px;border-radius:50%;border:2px solid #fff}.rm-dash{display:grid;grid-template-columns:248px minmax(0,1fr);gap:24px;align-items:start;margin-top:22px}.rm-dash-aside{background:#25282c;color:#fff;padding:22px 12px;border-radius:8px;position:sticky;top:160px}.rm-dash-aside h3{font:800 15px Manrope;margin:4px 12px 20px;color:#fff}.rm-dash-aside button{display:flex;align-items:center;gap:13px;width:100%;border:0;background:transparent;color:#bfc0c1;padding:15px 13px;text-align:left;font-size:12px;font-weight:700;border-radius:5px}.rm-dash-aside button.active,.rm-dash-aside button:hover{background:#424247;color:#fff}.rm-dash-aside button i{width:18px;text-align:center}.rm-dash-aside .nav-count{margin-left:auto;background:#b4384d;color:white;padding:2px 6px;border-radius:9px;font-size:10px}.rm-dash-top{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:28px;background:#fff;border:1px solid var(--line);border-radius:6px}.rm-dash-top h1{font:800 clamp(22px,3vw,32px) Manrope;margin:5px 0}.rm-dash-top p{margin:0;color:#777;font-size:12px}.rm-dash-top .btn{font-size:13px;min-height:47px}.rm-dash-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0}.rm-dash-stat{background:#fff;border:1px solid var(--line);padding:20px;border-radius:5px;min-width:0}.rm-dash-stat i{color:#a43748}.rm-dash-stat strong{display:block;font:800 27px Manrope;margin:12px 0 3px}.rm-dash-stat span{font-size:11px;color:#777}.rm-dash-panel{background:#fff;border:1px solid var(--line);border-radius:6px;padding:23px;margin-bottom:16px}.rm-dash-panel h2{font:800 20px Manrope;margin:0 0 7px}.rm-dash-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}.rm-dash-actions button{background:#f7f5f1;border:1px solid #e8e3dc;border-radius:5px;padding:20px;text-align:left;display:flex;flex-direction:column;gap:10px;color:#292724;font-weight:700}.rm-dash-actions button i{font-size:21px;color:#a43748}.rm-dash-actions small{color:#817d76;font-weight:400}.rm-dash-select{width:100%;max-width:320px;border:1px solid #ded9d1;border-radius:4px;background:white;padding:10px;font-size:12px}.rm-manager-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:20px}.rm-manager-head h2{margin:0}.rm-dash .manage-item{gap:13px}.rm-dash .manage-item>div{min-width:0}.rm-dash .manage-item img{flex-shrink:0}.rm-dash .manage-item strong{display:block;overflow-wrap:anywhere}.rm-dash .order-card{background:#fff}.rm-steps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:25px 0}.rm-step{padding:25px;background:#fff;border:1px solid var(--line);border-radius:5px}.rm-step b{font:800 24px Manrope;color:#a43748}.rm-step h3{font:800 17px Manrope;margin:12px 0}.rm-step p{font-size:13px;line-height:1.7;color:#777}.rm-vote .fa-heart-crack{color:#6b6872}.rm-form-hint{background:#f7f5f1;padding:12px;border-radius:5px;font-size:12px;color:#777;margin:10px 0 18px}
@media(max-width:900px){.rm-dash{grid-template-columns:1fr}.rm-dash-aside{position:static;display:flex;overflow-x:auto;gap:5px;padding:8px;border-radius:5px;scrollbar-width:none}.rm-dash-aside h3{display:none}.rm-dash-aside button{min-width:max-content;width:auto;padding:12px}.rm-dash-stats{grid-template-columns:repeat(2,1fr)}}
@media(max-width:650px){.rm-hero-photo{aspect-ratio:1.65/1}.rm-hero-photo .hero-dots{left:12px;bottom:10px}.rm-dash{margin-top:12px;gap:12px}.rm-dash-top{padding:18px;display:block}.rm-dash-top .btn{margin-top:16px;width:100%}.rm-dash-top h1{font-size:24px}.rm-dash-panel{padding:16px}.rm-dash-stats{gap:8px}.rm-dash-stat{padding:15px}.rm-dash-stat strong{font-size:23px}.rm-dash-actions{grid-template-columns:1fr 1fr}.rm-dash-actions button{padding:14px;font-size:12px}.rm-manager-head{align-items:stretch;flex-direction:column}.rm-manager-head .btn{width:100%}.rm-dash .manage-item{flex-wrap:wrap}.rm-dash .manage-item>div:last-child{width:100%;flex-basis:100%;justify-content:flex-end}.rm-steps{grid-template-columns:1fr}.rm-step{padding:18px}.rm-notification em{right:-10px}}

</style></head><body><div class="card"><h1>R&M</h1><p>EXPERIÊNCIAS & PRESENTES</p><p style="font-size:50px"></p><p class="badge">VOCÊ GANHOU UM PRESENTE!</p><h2>${safe(p.name)}</h2><p>Para <b>${safe(o.recipient.name)}</b></p><p>Resgate em <b>${safe(o.store)}</b></p><p class="note">${safe(o.recipient.message||'Um carinho especial feito para você.')}</p><p>Seu código exclusivo</p><div class="code">${safe(o.voucher)}</div><p class="note">Apresente este código no estabelecimento. Válido para um único resgate, sujeito à confirmação pela loja.</p><button onclick="window.print()">Imprimir voucher</button></div>

</body></html>`;const a=document.createElement('a'),url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));a.href=url;a.download=`voucher-${o.voucher}.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function storesPage(){return `<div class="page"><h1 class="page-title">Lojas parceiras </h1><p class="subtitle">Encontre empresas que transformam presentes em experiências.</p><div class="products">${storeNames.map(s=>{let p=catalog.find(x=>x.store===s);return `<article class="product" onclick="openStore('${safe(s)}')"><div class="product-photo"><img src="${p.img}"></div><div class="product-body"><div class="store"><i class="fa-solid fa-circle-check"></i> Parceira verificada</div><h3>${safe(s)}</h3><p style="font-size:11px;color:#888">${catalog.filter(x=>x.store===s).length} opções para presentear</p><button class="btn" style="width:100%">Ver loja <i class="fa-solid fa-arrow-right"></i></button></div></article>`}).join('')}</div></div>`}
function openStore(s){selectedStore=s;page='store';render();scrollTo(0,0)}
function storePage(){let c=company(selectedStore);return `<div class="page"><div class="store-hero"><div><p><i class="fa-solid fa-circle-check"></i> Loja parceira R&M</p><h1>${safe(c.name)}</h1><p>${safe(c.description||'Experiências e presentes especiais')}</p><p><i class="fa-solid fa-location-dot"></i> ${safe(c.address)}</p></div><i class="fa-solid fa-store" style="font-size:75px;color:#ffffff50"></i></div><div class="section-head"><div><h2>Presentes desta loja</h2><p>Escolha a surpresa ideal.</p></div></div><div class="products">${catalog.filter(p=>p.store===selectedStore).map(productCard).join('')}</div></div>`}
function accountPage(){let u=currentUser();if(!u)return `<div class="page empty"><h3>Você precisa entrar na sua conta.</h3><button class="btn" onclick="showAuth()">Entrar</button></div>`;return `<div class="page"><h1 class="page-title">Minha conta </h1><p class="subtitle">Olá, ${safe(u.name)}!</p><div class="panel"><h3>Seus dados</h3><p><b>Nome:</b> ${safe(u.name)}</p><p><b>E-mail:</b> ${safe(u.email)}</p><p><b>Endereço:</b> ${safe(u.address)}</p><button class="btn btn-outline" onclick="navigate('orders')">Ver meus pedidos</button> <button class="btn btn-dark" onclick="logout()">Sair da conta</button></div></div>`}function logout(){session=null;save('session',null);navigate('home')}
function companyPage(){let companyOrders=orders.filter(o=>o.store===selectedStore);return `<div class="page"><h1 class="page-title">Central da empresa </h1><p class="subtitle">Gerencie sua loja, aprove pedidos e valide os presentes.</p><div class="field" style="max-width:340px"><label>Selecionar empresa</label><select onchange="selectedStore=this.value;render()">${storeNames.map(s=>`<option ${selectedStore===s?'selected':''}>${safe(s)}</option>`).join('')}</select></div><div class="dashboard"><aside class="dash-nav">${[['overview','fa-chart-pie','Visão geral'],['orders','fa-box','Pedidos'],['redeem','fa-qrcode','Resgatar voucher'],['settings','fa-gear','Configurações']].map(([id,ic,label])=>`<button class="${dashTab===id?'active':''}" onclick="dashTab='${id}';render()"><i class="fa-solid ${ic}"></i>${label}</button>`).join('')}</aside><div>${dashTab==='overview'?`<div class="stat-grid"><div class="stat"><i class="fa-solid fa-box"></i><strong>${companyOrders.length}</strong><span>Pedidos recebidos</span></div><div class="stat"><i class="fa-solid fa-clock"></i><strong>${companyOrders.filter(o=>o.status==='pending').length}</strong><span>Aguardando análise</span></div><div class="stat"><i class="fa-solid fa-ticket"></i><strong>${companyOrders.filter(o=>o.status==='redeemed').length}</strong><span>Vouchers resgatados</span></div></div><div class="panel"><h3>Pedidos recentes</h3>${companyOrders.length?companyOrders.slice(0,5).map(companyOrderCard).join(''):'<p>Nenhum pedido recebido ainda.</p>'}</div>`:dashTab==='orders'?`<div class="panel"><h3>Gerenciar pedidos</h3>${companyOrders.length?companyOrders.map(companyOrderCard).join(''):'<p>Os pedidos desta loja aparecerão aqui.</p>'}</div>`:dashTab==='redeem'?`<div class="panel"><h3>Resgatar voucher</h3><p style="font-size:12px;color:#888">Digite o código do voucher apresentado pelo cliente.</p><form onsubmit="findVoucher(event)"><div class="field"><label>Código do voucher</label><input name="code" placeholder="RMV-XXXXXXXXXXXX" required></div><button class="btn">Buscar voucher <i class="fa-solid fa-magnifying-glass"></i></button></form></div>`:`<div class="panel"><h3>Informações da empresa</h3><form onsubmit="saveCompany(event)"><div class="field"><label>Nome da empresa</label><input name="name" value="${safe(company(selectedStore).name)}" required></div><div class="field"><label>WhatsApp da empresa com DDI e DDD (ex.: 5589999999999)</label><input name="phone" value="${safe(company(selectedStore).phone)}" placeholder="5589999999999"></div><div class="field"><label>Chave Pix</label><input name="pix" value="${safe(company(selectedStore).pix)}" placeholder="Sua chave Pix"></div><div class="field"><label>Endereço</label><input name="address" value="${safe(company(selectedStore).address)}"></div><div class="field"><label>Descrição</label><textarea name="description" rows="3">${safe(company(selectedStore).description)}</textarea></div><button class="btn">Salvar alterações</button></form></div>`}</div></div></div>`}
function companyOrderCard(o){let p=prod(o.productId),u=users.find(x=>x.id===o.userId);return `<div class="order-card"><img src="${p.img}"><div class="order-info"><span class="status ${o.status==='pending'?'':o.status==='redeemed'?'redeemed':'approved'}">${statusText(o.status)}</span><h3>${safe(p.name)}</h3><p>${safe(o.number)} · Cliente: ${safe(u?.name||'Cliente')} · ${money(o.price)}</p><p>Pagamento: ${safe(o.payment)}</p>${o.recipient?`<p>Presenteado: ${safe(o.recipient.name)} · ${safe(o.voucher)}</p>`:''}<div class="order-actions">${o.status==='pending'?`<button class="btn btn-small" onclick="updateOrder('${o.id}','approved')">Aprovar pedido</button><button class="btn btn-outline btn-small" onclick="updateOrder('${o.id}','rejected')">Recusar</button>`:''}</div></div></div>`}
function updateOrder(id,status){let o=orders.find(x=>x.id===id);if(!o||o.store!==selectedStore||o.status!=='pending')return toast('Pedido não disponível');o.status=status;save('orders',orders);render();toast(status==='approved'?'Pedido aprovado!':'Pedido recusado')}
function saveCompany(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));companies[selectedStore]={...company(selectedStore),...d};save('companies',companies);render();toast('Informações da loja atualizadas')}
function findVoucher(e){e.preventDefault();const code=new FormData(e.target).get('code').trim().toUpperCase();const o=orders.find(x=>x.voucher===code&&x.store===selectedStore);if(!o)return toast('Voucher não encontrado para esta loja');modal(`<h2>Validação do voucher</h2><div class="voucher-preview"><i class="fa-solid fa-ticket" style="font-size:35px;color:var(--red)"></i><h3>${safe(prod(o.productId).name)}</h3><div class="code">${safe(o.voucher)}</div><p>Presenteado: <b>${safe(o.recipient?.name)}</b></p><p>WhatsApp: ${safe(o.recipient?.phone)}</p><span class="status ${o.status==='redeemed'?'redeemed':'approved'}">${statusText(o.status)}</span></div>${o.status==='approved'&&o.recipient?`<button class="btn" style="width:100%" onclick="redeemVoucher('${o.id}')">Confirmar resgate</button>`:'<div class="demo">Este voucher já foi utilizado ou não está disponível para resgate.</div>'}`)}
function redeemVoucher(id){let o=orders.find(x=>x.id===id);if(!o||o.store!==selectedStore||o.status!=='approved'||!o.recipient)return toast('Resgate não permitido');o.status='redeemed';o.redeemedAt=new Date().toISOString();save('orders',orders);closeModal();render();toast('Voucher resgatado! Não poderá ser utilizado novamente.')}

/* Marketplace v2: cidade, vitrines, lojas e pagamentos configuráveis */
const originalRender=render;
const originalCompanyPage=companyPage;
const originalCheckoutRender=checkoutRender;
const originalContinueCheckout=continueCheckout;
let chosenCity=read('city',null),welcomeDismissed=read('welcomeDismissed',false),settingsTab='profile',listType='products',scanner=null;
const cityNames=['Uruçuí'];
const typeOf=p=>p.category==='Vale-compras'||p.name.toLowerCase().startsWith('vale')?'vouchers':(['Beleza & Spa','Experiências'].includes(p.category)||/jantar|almoço|hambúrguer|massagem|ensaio|spa/i.test(p.name))?'experiences':'products';
const typeTitle={products:'Produtos',experiences:'Experiências',vouchers:'Vale-compras'};
const storeCity=s=>company(s).city||'Uruçuí';
const visibleCatalog=()=>catalog.filter(p=>!chosenCity||storeCity(p.store)===chosenCity);
function selectCity(){modal(`<div class="editorial-kicker">Sua região</div><h2>Onde você quer presentear?</h2><p>Selecione sua cidade para ver somente os presentes e estabelecimentos disponíveis nela.</p><div class="field"><label>Estado</label><select><option>Piauí</option></select></div><div class="field"><label>Cidade</label><select id="city-choice">${cityNames.map(c=>`<option>${c}</option>`).join('')}</select></div><button class="btn" style="width:100%" onclick="chooseCity(document.getElementById('city-choice').value)">Ver presentes da minha cidade</button><button class="btn btn-outline" style="width:100%" onclick="chooseCity(null)">Ver todas as regiões</button>`)}
function chooseCity(c){chosenCity=c;save('city',c);closeModal();navigate('home')}
function dismissWelcome(){welcomeDismissed=true;save('welcomeDismissed',true);document.querySelector('.welcome')?.remove()}
function cardShelf(type,title,sub){const id='shelf-'+type;const items=shuffle(visibleCatalog().filter(p=>typeOf(p)===type));return `<section class="shelf"><div class="section-head"><div><div class="editorial-kicker">${typeTitle[type]}</div><h2>${title}</h2><p>${sub}</p></div><button class="text-link" onclick="openListing('${type}')">Ver todos <i class="fa-solid fa-arrow-right"></i></button><div class="shelf-tools"><button class="arrow-btn" aria-label="Anterior" onclick="moveShelf('${id}',-1)"><i class="fa-solid fa-chevron-left"></i></button><button class="arrow-btn" aria-label="Próximo" onclick="moveShelf('${id}',1)"><i class="fa-solid fa-chevron-right"></i></button></div></div><div class="shelf-track" id="${id}">${items.length?items.map(productCard).join(''):'<p>Nenhuma opção disponível nesta região ainda.</p>'}</div></section>`}
function moveShelf(id,dir){document.getElementById(id)?.scrollBy({left:dir*520,behavior:'smooth'})}
function storeTile(s){const c=company(s),p=catalog.find(x=>x.store===s);return `<button class="store-tile" onclick="openStore('${safe(s)}')"><div class="store-cover"><img loading="lazy" src="${p.img}" alt=""></div><div class="store-logo">${c.logo?`<img src="${safe(c.logo)}" alt="">`:safe(s.slice(0,2).toUpperCase())}</div><div class="store-tile-body"><strong>${safe(c.name)}</strong><small><i class="fa-solid fa-circle-check" style="color:#428a86"></i> Loja parceira · ${safe(storeCity(s))}</small></div></button>`}
function storeShelf(){let stores=shuffle(storeNames.filter(s=>!chosenCity||storeCity(s)===chosenCity));return `<section class="shelf"><div class="section-head"><div><div class="editorial-kicker">Comércio local</div><h2>Conheça quem faz acontecer</h2><p>Lojas e profissionais que tornam cada surpresa possível.</p></div><button class="text-link" onclick="navigate('stores')">Ver todas</button><div class="shelf-tools"><button class="arrow-btn" onclick="moveShelf('store-carousel',-1)"><i class="fa-solid fa-chevron-left"></i></button><button class="arrow-btn" onclick="moveShelf('store-carousel',1)"><i class="fa-solid fa-chevron-right"></i></button></div></div><div class="store-track" id="store-carousel">${stores.map(storeTile).join('')}</div></section>`}
home=function(){return `<section class="hero"><div class="hero-grid"><div class="hero-main"><img src="${photo('photo-1513201099705-a9746e1e201f',850)}" alt="Presentes"><div class="hero-content"><span class="eyebrow">R&M · PRESENTES E EXPERIÊNCIAS</span><h1>O presente certo. Para alguém especial.</h1><p>Produtos, experiências e vale-compras das lojas da sua região, em um só lugar.</p><button class="btn btn-white" onclick="document.getElementById('showcase').scrollIntoView({behavior:'smooth'})">Explorar presentes <i class="fa-solid fa-arrow-right"></i></button></div></div><div class="hero-side"><div class="side-banner"><img src="${photo('photo-1540555700478-4be289fbecef',500)}"><div><span class="mini">EXPERIÊNCIAS</span><strong>Tempo bem vivido é presente.</strong><p>Momentos para lembrar</p></div></div><div class="side-banner"><img src="${photo('photo-1441986300917-64674bd600d8',500)}"><div><span class="mini">VALE-COMPRAS</span><strong>O prazer de escolher.</strong><p>Liberdade para surpreender</p></div></div></div></div></section>${!welcomeDismissed?`<div class="welcome"><div><div class="editorial-kicker">Bem-vindo à R&M</div><h2>Que bom ter você por aqui.</h2><p>Reunimos presentes de diferentes regiões para você descobrir novas possibilidades. Escolha sua cidade e encontre o que está disponível pertinho de você.</p></div><div class="welcome-actions"><button class="btn" onclick="selectCity()">Escolher minha cidade</button><button class="plain-x" aria-label="Fechar boas-vindas" onclick="dismissWelcome()">×</button></div></div>`:''}<div class="city-strip"><div><strong><i class="fa-solid fa-location-dot" style="color:var(--red)"></i> ${chosenCity?safe(chosenCity)+' · Piauí':'Explorando todas as regiões'}</strong><p>${chosenCity?'Você está vendo somente opções da cidade selecionada.':'Filtre sua cidade para descobrir produtos, experiências e vale-compras perto de você.'}</p></div><button class="btn btn-outline" onclick="selectCity()">${chosenCity?'Alterar cidade':'Filtrar minha cidade'} <i class="fa-solid fa-chevron-down"></i></button></div><div class="type-nav"><button onclick="openListing('products')"><i class="fa-solid fa-box-open"></i> Produtos</button><button onclick="openListing('experiences')"><i class="fa-regular fa-calendar-check"></i> Experiências</button><button onclick="openListing('vouchers')"><i class="fa-solid fa-ticket"></i> Vale-compras</button></div><div id="showcase">${cardShelf('products','Guardamos para você...','Escolhas especiais que merecem virar presente.')}${cardShelf('experiences','Momentos que valem mais que coisas.','Experiências para viver, sentir e recordar.')}${cardShelf('vouchers','Deixe a escolha nas mãos de quem recebe.','Vale-compras para acertar em cheio.')}</div>${storeShelf()}<div class="wide-promo"><div><h2>Presentear pode ser simples.</h2><p>Escolha um presente, acompanhe o pedido e envie um voucher exclusivo.</p></div><button class="btn btn-white" onclick="openListing('products')">Encontrar um presente</button></div>`};
function openListing(type){listType=type;page='listing';filter='Todos';searchTerm='';render();scrollTo(0,0)}
function listingPage(){let items=shuffle(visibleCatalog().filter(p=>typeOf(p)===listType&&(`${p.name} ${p.store}`.toLowerCase().includes(searchTerm.toLowerCase()))));return `<div class="page"><button class="text-link" onclick="navigate('home')"><i class="fa-solid fa-arrow-left"></i> Voltar à loja</button><h1 class="page-title" style="margin-top:18px">${typeTitle[listType]}</h1><p class="subtitle">${chosenCity?'Disponíveis em '+safe(chosenCity):'Opções de todas as regiões'} · ${items.length} opções</p><div id="listing-items">${items.map(p=>`<article class="list-product"><img loading="lazy" src="${p.img}" alt="${safe(p.name)}"><div><div class="store">${safe(p.store)} · ${safe(storeCity(p.store))}</div><h3>${safe(p.name)}</h3><p>${safe(p.desc)}</p></div><div class="list-actions"><div class="price">${money(p.price)}</div><button class="btn" onclick="showProduct(${p.id})">Presentear</button></div></article>`).join('')||'<div class="panel">Nenhum item encontrado.</div>'}</div></div>`}
render=function(){originalRender();if(page==='listing')document.querySelector('main.container').innerHTML=listingPage();const nav=document.querySelector('.nav');if(nav){nav.innerHTML=`<button onclick="navigate('home')">Início</button><button onclick="openListing('products')">Produtos</button><button onclick="openListing('experiences')">Experiências</button><button onclick="openListing('vouchers')">Vale-compras</button><button onclick="navigate('stores')">Lojas parceiras</button><button class="location" onclick="selectCity()"><i class="fa-solid fa-location-dot"></i> ${safe(chosenCity||'Todas as regiões')} <i class="fa-solid fa-chevron-down"></i></button>`}const search=document.querySelector('.search input');if(search)search.oninput=function(){searchTerm=this.value;if(page==='listing'){document.getElementById('listing-items').innerHTML=shuffle(visibleCatalog().filter(p=>typeOf(p)===listType&&(`${p.name} ${p.store}`.toLowerCase().includes(searchTerm.toLowerCase())))).map(p=>`<article class="list-product"><img src="${p.img}"><div><small>${safe(p.store)}</small><h3>${safe(p.name)}</h3><p>${safe(p.desc)}</p></div><div class="list-actions"><div class="price">${money(p.price)}</div><button class="btn" onclick="showProduct(${p.id})">Presentear</button></div></article>`).join('')}else{openListing('products')}}};
renderProducts=function(){};
setFilter=function(c){openListing(c==='Vale-compras'?'vouchers':c==='Beleza & Spa'||c==='Gastronomia'?'experiences':'products')};
storesPage=function(){return `<div class="page"><h1 class="page-title">Lojas parceiras</h1><p class="subtitle">Descubra negócios que fazem parte da R&M.</p><div class="city-strip"><div><strong>${chosenCity?safe(chosenCity):'Todas as regiões'}</strong><p>Explore lojas disponíveis.</p></div><button class="btn btn-outline" onclick="selectCity()">Filtrar cidade</button></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:15px">${shuffle(storeNames.filter(s=>!chosenCity||storeCity(s)===chosenCity)).map(storeTile).join('')}</div></div>`};
storePage=function(){const c=company(selectedStore),p=catalog.find(x=>x.store===selectedStore);return `<div class="page"><button class="text-link" onclick="navigate('stores')"><i class="fa-solid fa-arrow-left"></i> Todas as lojas</button><div class="store-profile" style="margin-top:18px"><div class="store-profile-cover"><img src="${p.img}" alt=""></div><div class="store-profile-body"><div class="store-logo">${c.logo?`<img src="${safe(c.logo)}" alt="">`:safe(selectedStore.slice(0,2).toUpperCase())}</div><div><h1>${safe(c.name)}</h1><p><i class="fa-solid fa-circle-check" style="color:#428a86"></i> Parceira R&M · <i class="fa-solid fa-location-dot"></i> ${safe(c.address||storeCity(selectedStore))}</p><p>${safe(c.description)}</p></div></div></div><div class="section-head"><div><h2>Presentes desta loja</h2><p>Produtos e experiências escolhidos para surpreender.</p></div></div><div class="products">${shuffle(catalog.filter(x=>x.store===selectedStore)).map(productCard).join('')}</div></div>`};
function getPayment(s){return {...{pix:'',receiver:'',bank:'',cash:true,credit:true},...(company(s).payment||{}),pix:company(s).payment?.pix||company(s).pix||''}}
checkoutRender=function(){const p=prod(selected),c=company(p.store),pay=getPayment(p.store);if(checkoutStep===0){const offline=pay.cash||pay.credit;if(!offline)checkoutMethod='pix';modal(`<h2>Finalizar presente</h2><p>Escolha como deseja pagar.</p><div class="order-card"><img src="${p.img}"><div class="order-info"><h3>${safe(p.name)}</h3><p>${safe(p.store)}</p><strong>${money(p.price)}</strong></div></div><div class="pay-choice ${checkoutMethod==='pix'?'selected':''}" onclick="checkoutMethod='pix';checkoutRender()"><i class="fa-brands fa-pix"></i><div><strong>Pix</strong><small>Transferência para a loja parceira</small></div></div>${offline?`<div class="pay-choice ${checkoutMethod==='cash'?'selected':''}" onclick="checkoutMethod='cash';checkoutRender()"><i class="fa-solid fa-credit-card"></i><div><strong>Pagamento presencial</strong><small>Conforme as formas aceitas pela loja</small></div></div>${checkoutMethod==='cash'?`<div class="field"><label>Forma de pagamento</label><select id="pay-detail">${pay.cash?'<option>À vista</option>':''}${pay.credit?'<option>Cartão de crédito</option>':''}</select></div>`:''}`:''}<button class="btn" style="width:100%" onclick="continueCheckout()">Continuar</button><p class="muted-note">A confirmação do pagamento deve ser realizada diretamente com a empresa.</p>`);return}if(checkoutStep===1){modal(`<h2>Pagamento por Pix</h2><p>Confira os dados informados pela empresa antes de pagar.</p><div class="voucher-preview"><h2>${money(p.price)}</h2><p><strong>${safe(pay.receiver||c.name)}</strong></p><p>${safe(pay.bank||'Banco não informado')}</p><div class="summary" style="overflow-wrap:anywhere">Chave Pix: <strong>${safe(pay.pix||'Não configurada')}</strong></div></div>${pay.pix?`<button class="btn btn-outline" style="width:100%" onclick="copyText(getPayment(prod(selected).store).pix)">Copiar chave Pix</button>`:''}<p class="muted-note">Confira a chave Pix com a empresa. A confirmação do pagamento depende da conferência pela empresa.</p><button class="btn" style="width:100%" onclick="checkoutStep=2;checkoutRender()">Já realizei o pagamento</button>`);return}originalCheckoutRender()};
companyPage=function(){if(dashTab!=='settings'&&dashTab!=='redeem')return originalCompanyPage();let base=originalCompanyPage();let start=base.indexOf('<div class="dashboard">');if(start<0)return base;let prefix=base.slice(0,start);let nav=`<div class="dashboard"><aside class="dash-nav">${[['overview','fa-chart-pie','Visão geral'],['orders','fa-box','Pedidos'],['redeem','fa-qrcode','Resgatar voucher'],['settings','fa-gear','Configurações']].map(([id,ic,label])=>`<button class="${dashTab===id?'active':''}" onclick="dashTab='${id}';render()"><i class="fa-solid ${ic}"></i>${label}</button>`).join('')}</aside><div>`;if(dashTab==='redeem')return prefix+nav+`<div class="panel"><h3>Resgatar voucher</h3><p class="subtitle">Digite o código ou leia o QR Code apresentado pelo cliente.</p><form onsubmit="findVoucher(event)"><div class="field"><label>Código do voucher</label><input id="voucher-code" name="code" placeholder="RMV-XXXXXXXXXXXX" required></div><button class="btn">Buscar voucher</button> <button type="button" class="btn btn-outline" onclick="startScanner()"><i class="fa-solid fa-camera"></i> Escanear QR Code</button></form><div id="scanner-area" style="margin-top:18px"></div></div></div></div></div>`;const c=company(selectedStore),pay=getPayment(selectedStore);return prefix+nav+`<div class="panel"><h3>Configurações da empresa</h3><div class="settings-tabs"><button class="${settingsTab==='profile'?'active':''}" onclick="settingsTab='profile';render()">Perfil e identidade</button><button class="${settingsTab==='payment'?'active':''}" onclick="settingsTab='payment';render()">Pagamentos</button><button class="${settingsTab==='contact'?'active':''}" onclick="settingsTab='contact';render()">Contato e localização</button></div><form onsubmit="saveAdvancedCompany(event)">${settingsTab==='profile'?`<div class="field"><label>Nome da empresa</label><input name="name" required value="${safe(c.name)}"></div><div class="field"><label>URL da logomarca</label><input name="logo" placeholder="https://..." value="${safe(c.logo||'')}"></div><div class="field"><label>Descrição</label><textarea name="description" rows="4">${safe(c.description)}</textarea></div>`:settingsTab==='contact'?`<div class="field"><label>WhatsApp (DDI + DDD)</label><input name="phone" value="${safe(c.phone)}" placeholder="5589999999999"></div><div class="field"><label>Endereço completo</label><input name="address" value="${safe(c.address)}"></div><div class="field"><label>Cidade</label><select name="city">${cityNames.map(x=>`<option ${storeCity(selectedStore)===x?'selected':''}>${x}</option>`).join('')}</select></div>`:`<div class="field"><label>Chave Pix</label><input name="pix" value="${safe(pay.pix)}" placeholder="CPF, e-mail, telefone ou chave aleatória"></div><div class="field"><label>Nome do recebedor</label><input name="receiver" value="${safe(pay.receiver)}" placeholder="Nome da pessoa ou empresa"></div><div class="field"><label>Banco</label><input name="bank" value="${safe(pay.bank)}" placeholder="Instituição financeira"></div><h3 style="margin-top:24px">Outras formas de pagamento</h3><p class="muted-note">Desmarque as formas que sua loja não aceita. Se ambas estiverem desmarcadas, o cliente verá somente Pix.</p><label class="check-line"><input type="checkbox" name="cash" ${pay.cash?'checked':''}> Aceitar pagamento à vista no estabelecimento</label><label class="check-line"><input type="checkbox" name="credit" ${pay.credit?'checked':''}> Aceitar cartão de crédito no estabelecimento</label>`}<button class="btn">Salvar configurações</button></form></div></div></div></div>`};
function saveAdvancedCompany(e){e.preventDefault();let d=Object.fromEntries(new FormData(e.target));let c=company(selectedStore);if(settingsTab==='payment'){c.payment={pix:d.pix.trim(),receiver:d.receiver.trim(),bank:d.bank.trim(),cash:!!d.cash,credit:!!d.credit};c.pix=d.pix.trim()}else{Object.assign(c,d)}companies[selectedStore]=c;save('companies',companies);render();toast('Configurações salvas')}
async function startScanner(){const area=document.getElementById('scanner-area');if(!area)return;area.innerHTML='<video id="scanner-video" autoplay playsinline muted style="width:100%;max-height:300px;background:#111;border-radius:9px"></video><p class="muted-note">Aponte a câmera para o QR Code do voucher.</p><button class="btn btn-outline" onclick="stopScanner()">Fechar câmera</button>';if(!navigator.mediaDevices?.getUserMedia){toast('Câmera indisponível neste navegador');return}try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});scanner={stream,active:true};const v=document.getElementById('scanner-video');if(!v){stream.getTracks().forEach(t=>t.stop());return}v.srcObject=stream;await v.play();if(!('BarcodeDetector'in window)){toast('Leitura automática não suportada neste navegador. Digite o código.');return}const detector=new BarcodeDetector({formats:['qr_code']});async function scan(){if(!scanner?.active)return;try{const codes=await detector.detect(v);if(codes.length){let value=codes[0].rawValue;let match=value.match(/RMV-[A-Z0-9]+/i);document.getElementById('voucher-code').value=match?match[0]:value;stopScanner();document.getElementById('voucher-code').closest('form').requestSubmit();return}}catch{}if(scanner?.active)requestAnimationFrame(scan)}scan()}catch{area.innerHTML='';toast('Não foi possível abrir a câmera. Verifique as permissões e use HTTPS ou localhost.')}}
function stopScanner(){if(scanner){scanner.active=false;scanner.stream.getTracks().forEach(t=>t.stop());scanner=null}const area=document.getElementById('scanner-area');if(area)area.innerHTML=''}
const oldNavigate=navigate;navigate=function(p){stopScanner();oldNavigate(p)};
const oldDownloadVoucher=downloadVoucher;
downloadVoucher=function(id){const o=orders.find(x=>x.id===id);if(!o?.recipient)return;const p=prod(o.productId);const data=`R&M VOUCHER: ${o.voucher}`;const qr=`https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=${encodeURIComponent(data)}`;const html=`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Voucher ${safe(o.voucher)}</title><style>body{background:#f5f4f1;font:15px Arial,sans-serif;padding:25px;color:#27272b}.card{max-width:460px;margin:auto;background:#fff;padding:40px 25px;border:1px solid #e5e3df;border-radius:12px;text-align:center}h1{font-size:38px;letter-spacing:-2px;color:#b73d4e}h2{font-size:26px}.qr{width:210px;height:210px;margin:15px auto}.code{font-weight:bold;letter-spacing:2px;padding:14px;background:#f7f5f3}.small{font-size:12px;color:#777;line-height:1.6}button{padding:12px 20px;background:#b73d4e;color:white;border:0;border-radius:6px}@media print{button{display:none}}</style><div class="card"><h1>R&M</h1><p>EXPERIÊNCIAS & PRESENTES</p><p>UM PRESENTE ESPECIAL PARA</p><h2>${safe(o.recipient.name)}</h2><h2>${safe(p.name)}</h2><p>${safe(o.recipient.message||'Um carinho feito para você.')}</p><p>Disponível em ${safe(o.store)}</p><img class="qr" src="${qr}" alt="QR Code do voucher"><div class="code">${safe(o.voucher)}</div><p class="small">Apresente este voucher na loja para resgate único. A validação é feita pelo estabelecimento.</p><button onclick="print()">Imprimir</button></div></html>`;const a=document.createElement('a'),url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));a.href=url;a.download=`voucher-${o.voucher}.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};


/* R&M terceira evolução — vitrines, gestão de anúncios e consentimento */
let extraProducts=read('extraProducts',[]),heroIndex=0,heroTimer=null;
for(const item of extraProducts){if(!catalog.some(p=>String(p.id)===String(item.id)))catalog.push(item)}
const originalProd=prod;
prod=function(id){return catalog.find(p=>String(p.id)===String(id))};
const slidesRM=[
 {title:'O presente certo. Para alguém especial.',subtitle:'Encontre presentes que surpreendem e experiências que ficam na memória.',image:photo('photo-1513201099705-a9746e1e201f',1000)},
 {title:'Momentos que merecem ser vividos.',subtitle:'Experiências especiais de empresas da sua região.',image:photo('photo-1540555700478-4be289fbecef',1000)},
 {title:'Liberdade para escolher o que amar.',subtitle:'Vale-compras e presentes para cada ocasião.',image:photo('photo-1441986300917-64674bd600d8',1000)}
];
const firstVisitBannerRM = !localStorage.getItem("rm_banner_visited_v4");
localStorage.setItem("rm_banner_visited_v4", "1");
function heroRM(){const x=slidesRM[heroIndex];return firstVisitBannerRM ? `<section class="hero"><div class="hero-main"><img src="${x.image}" alt="Campanha R&M"><div class="hero-content"><span class="eyebrow">R&M · PRESENTES E EXPERIÊNCIAS</span><h1>${x.title}</h1><p>${x.subtitle}</p><button class="btn btn-white" onclick="document.getElementById('home-shelves')?.scrollIntoView({behavior:'smooth'})">Explorar presentes <i class="fa-solid fa-arrow-right"></i></button></div><div class="hero-dots">${slidesRM.map((_,i)=>`<button aria-label="Banner ${i+1}" class="${heroIndex===i?'active':''}" onclick="setHero(${i})"></button>`).join('')}</div></div></section>` : ""}
function setHero(i){heroIndex=(i+slidesRM.length)%slidesRM.length;const node=document.querySelector('.hero');if(node)node.outerHTML=heroRM()}
function initHero(){clearInterval(heroTimer);if(page==='home' && firstVisitBannerRM)heroTimer=setInterval(()=>{if(page==='home')setHero(heroIndex+1)},5500)}
function promoRM(){return `<section class="merchant-cta"><div><span class="editorial-kicker">PARA NEGÓCIOS LOCAIS</span><h2>Sua empresa tem lugar na R&M.</h2><p>Anuncie produtos, experiências e vale-compras. Conquiste novos clientes e venda mais.</p></div><button class="btn btn-white" onclick="navigate('advertise')">Quero anunciar na R&M <i class="fa-solid fa-arrow-right"></i></button></section>`}
const previousHome=home;
home=function(){let html=previousHome();const first=html.indexOf('<section class="hero">');const after=html.indexOf('</section>',first);if(first>=0&&after>=0)html=html.slice(0,first)+heroRM()+html.slice(after+10);html=html.replace(/<section class="shelf">/, '<div id="home-shelves"></div><section class="shelf">');return html+promoRM()};
const originalCardShelf=cardShelf;
cardShelf=function(type,title,sub){return originalCardShelf(type,type==='products'?'Guardamos pra você':type==='experiences'?'Histórias boas começam com uma experiência':'Um presente, infinitas escolhas',sub)};
const originalListingPage=listingPage;
listingPage=function(){const items=shuffle(visibleCatalog().filter(p=>typeOf(p)===listType&&(`${p.name} ${p.store}`.toLowerCase().includes(searchTerm.toLowerCase()))));return `<div class="page"><button class="text-link" onclick="navigate('home')">Voltar ao início</button><h1 class="page-title" style="margin-top:20px">${typeTitle[listType]}</h1><p class="subtitle">${items.length} opções para presentear${chosenCity?' em '+safe(chosenCity):''}</p>${items.map(p=>`<article class="listing-row"><img src="${safe(p.img)}" alt="${safe(p.name)}"><div><div class="store">${safe(p.store)} · ${safe(storeCity(p.store))}</div><h3>${safe(p.name)}</h3><p>${safe(p.desc||'Um presente especial.')}</p><strong class="price">${money(p.price)}</strong></div><button class="btn" onclick="showProduct('${p.id}')">Presentear <i class="fa-solid fa-arrow-right"></i></button></article>`).join('')||'<div class="panel">Nenhum item disponível nesta categoria.</div>'}</div>`};
showProduct=function(id){const p=prod(id);if(!p)return;modal(`<div class="detail-layout"><div><img src="${safe(p.img)}" alt="${safe(p.name)}"><p class="muted-note">Oferta da empresa parceira · ${safe(storeCity(p.store))}</p></div><div><span class="editorial-kicker">${safe(typeTitle[typeOf(p)])}</span><h2>${safe(p.name)}</h2><p class="store"><i class="fa-solid fa-circle-check"></i> ${safe(p.store)}</p><p style="font-size:14px;line-height:1.8">${safe(p.desc||'Uma escolha especial para presentear.')}</p><hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><div class="price">${money(p.price)}</div><p class="muted-note">Voucher digital após a aprovação da empresa. Resgate no estabelecimento.</p><button class="btn" style="width:100%" onclick="startCheckout('${p.id}')">Comprar e presentear <i class="fa-solid fa-arrow-right"></i></button><button class="btn btn-outline" style="width:100%;margin-top:9px" onclick="openStore('${safe(p.store)}')">Conhecer a empresa</button></div></div>`,true)};
function productManager(){const list=catalog.filter(p=>p.store===selectedStore);return `<div class="panel"><h3>Meus anúncios</h3><p class="subtitle">Cadastre e gerencie seus produtos, experiências e vale-compras.</p><button class="btn" onclick="productForm()">Adicionar anúncio <i class="fa-solid fa-plus"></i></button>${list.map(p=>`<div class="manage-item"><img src="${safe(p.img)}"><div><strong>${safe(p.name)}</strong><small>${safe(typeTitle[typeOf(p)])} · ${money(p.price)}</small></div>${p.custom?`<button class="btn btn-outline btn-small" onclick="productForm('${p.id}')">Editar</button><button class="btn btn-outline btn-small" onclick="removeProduct('${p.id}')">Excluir</button>`:'<small>Catálogo</small>'}</div>`).join('')}</div>`}
function productForm(id){const p=id?prod(id):null;modal(`<h2>${p?'Editar anúncio':'Novo anúncio'}</h2><p>As informações serão exibidas na vitrine da R&M.</p><form onsubmit="saveProductRM(event,'${id||''}')"><div class="field"><label>Tipo de anúncio</label><select name="kind"><option value="products" ${p&&typeOf(p)==='products'?'selected':''}>Produto</option><option value="experiences" ${p&&typeOf(p)==='experiences'?'selected':''}>Experiência</option><option value="vouchers" ${p&&typeOf(p)==='vouchers'?'selected':''}>Vale-compras</option></select></div><div class="field"><label>Nome do anúncio</label><input name="name" required maxlength="90" value="${safe(p?.name||'')}"></div><div class="form-grid"><div class="field"><label>Preço (R$)</label><input name="price" type="number" min="0.01" step="0.01" required value="${p?.price||''}"></div><div class="field"><label>Destaque / selo</label><input name="tag" maxlength="35" value="${safe(p?.tag||'Novidade')}"></div></div><div class="field"><label>Descrição completa</label><textarea name="desc" rows="4" required>${safe(p?.desc||'')}</textarea></div><div class="field"><label>Imagem do anúncio</label><input type="file" accept="image/png,image/jpeg,image/webp" id="new-product-image"><p class="muted-note">Imagem JPG, PNG ou WebP de até 1,5 MB. ${p?'Mantenha vazio para preservar a imagem atual.':''}</p></div><button class="btn" style="width:100%">${p?'Salvar alterações':'Publicar anúncio'}</button></form>`,true)}
async function imageData(input){const file=input?.files?.[0];if(!file)return null;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>1500000)throw Error('Escolha uma imagem JPG, PNG ou WebP de até 1,5 MB.');return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
async function saveProductRM(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));try{const img=await imageData(document.getElementById('new-product-image'));let p=id?extraProducts.find(x=>String(x.id)===String(id)):null;if(!p){p={id:'custom-'+uid(),store:selectedStore,custom:true};extraProducts.push(p);catalog.push(p)}Object.assign(p,{name:d.name.trim(),price:Number(d.price),desc:d.desc.trim(),tag:d.tag.trim(),category:d.kind==='vouchers'?'Vale-compras':d.kind==='experiences'?'Experiências':'Produtos',img:img||p.img||photo('photo-1549465220-1a8b9238cd48')});save('extraProducts',extraProducts);closeModal();render();toast('Anúncio salvo com sucesso')}catch(err){toast(err.message||'Não foi possível salvar a imagem')}}
function removeProduct(id){if(!confirm('Excluir este anúncio?'))return;extraProducts=extraProducts.filter(p=>String(p.id)!==String(id));const i=catalog.findIndex(p=>String(p.id)===String(id));if(i>=0)catalog.splice(i,1);save('extraProducts',extraProducts);render();toast('Anúncio excluído')}
function logoSettings(){const c=company(selectedStore);return `<div class="panel"><h3>Identidade da empresa</h3><p class="subtitle">Sua logo aparece na vitrine e na página da loja.</p>${c.logo?`<img class="upload-preview" src="${safe(c.logo)}" alt="Logo atual">`:''}<div class="field"><label>Enviar logo da empresa</label><input id="company-logo-file" type="file" accept="image/png,image/jpeg,image/webp"></div><button class="btn" onclick="saveLogoRM()">Salvar logo</button></div>`}
async function saveLogoRM(){try{const img=await imageData(document.getElementById('company-logo-file'));if(!img)return toast('Selecione uma imagem.');companies[selectedStore]={...company(selectedStore),logo:img};save('companies',companies);render();toast('Logo atualizada')}catch(e){toast(e.message)}}
const prevCompanyPageRM=companyPage;
companyPage=function(){if(dashTab==='products')return `<div class="page"><h1 class="page-title">Minha empresa</h1><p class="subtitle">Gerencie os anúncios de ${safe(selectedStore)}.</p><div class="field" style="max-width:340px"><label>Empresa</label><select onchange="selectedStore=this.value;render()">${storeNames.map(s=>`<option ${s===selectedStore?'selected':''}>${safe(s)}</option>`).join('')}</select></div><div class="dashboard"><aside class="dash-nav">${dashMenuRM()}</aside>${productManager()}</div></div>`;let html=prevCompanyPageRM();if(dashTab==='settings')html=html.replace('</div></div></div></div>',`${logoSettings()}</div></div></div></div>`);return html.replace(/<\/aside>/,`<button class="${dashTab==='products'?'active':''}" onclick="dashTab='products';render()"><i class="fa-solid fa-box-open"></i> Meus anúncios</button></aside>`)};
function dashMenuRM(){return [['overview','fa-chart-pie','Visão geral'],['orders','fa-box','Pedidos'],['products','fa-box-open','Meus anúncios'],['redeem','fa-qrcode','Resgatar voucher'],['settings','fa-gear','Configurações']].map(([id,ic,name])=>`<button class="${dashTab===id?'active':''}" onclick="dashTab='${id}';render()"><i class="fa-solid ${ic}"></i>${name}</button>`).join('')}
function advertisePage(){return `<div class="page"><div class="merchant-cta"><div><span class="editorial-kicker">SEJA PARCEIRO</span><h2>Venda mais com a R&M.</h2><p>Seu negócio na vitrine de quem procura presentes, experiências e vale-compras.</p><button class="btn btn-white" onclick="dashTab='products';navigate('company')">Conhecer o painel de anúncios</button></div><i class="fa-solid fa-store" style="font-size:80px;opacity:.3"></i></div><div class="benefits"><div class="benefit"><i class="fa-solid fa-shop"></i><div><strong>Vitrine digital</strong><span>Seus anúncios no marketplace</span></div></div><div class="benefit"><i class="fa-solid fa-ticket"></i><div><strong>Vouchers digitais</strong><span>Presentes para resgatar</span></div></div><div class="benefit"><i class="fa-solid fa-mobile-screen"></i><div><strong>Compras simples</strong><span>Clientes pelo celular</span></div></div><div class="benefit"><i class="fa-solid fa-chart-line"></i><div><strong>Gestão de pedidos</strong><span>Aprove e acompanhe vendas</span></div></div></div><div class="panel"><h3>Como participar?</h3><p>Cadastre sua empresa, configure os recebimentos e publique seus anúncios. Esta versão demonstra o fluxo; o cadastro comercial definitivo será habilitado com o sistema online.</p><button class="btn" onclick="dashTab='products';navigate('company')">Explorar painel</button></div></div>`}
function dismissWelcomeRM(){sessionStorage.setItem('rm_welcome_seen','1');document.getElementById('welcome-rm')?.remove()}
function welcomeRM(){if(sessionStorage.getItem('rm_welcome_seen'))return;document.body.insertAdjacentHTML('beforeend',`<div class="welcome-overlay" id="welcome-rm"><div class="welcome-card"><button class="close" aria-label="Fechar" onclick="dismissWelcomeRM()">×</button><div class="editorial-kicker">BEM-VINDO À R&M</div><h2>Um novo jeito de fazer alguém feliz.</h2><p style="line-height:1.8;color:var(--muted)">Explore presentes, experiências e vale-compras de diferentes regiões. Escolha sua cidade para encontrar opções perto de você.</p><button class="btn" style="width:100%" onclick="dismissWelcomeRM();selectCity()">Filtrar minha cidade</button><button class="btn btn-outline" style="width:100%;margin-top:9px" onclick="dismissWelcomeRM()">Explorar todas as regiões</button></div></div>`)}
function cookieRM(){if(localStorage.getItem('rm_cookie_choice'))return;document.body.insertAdjacentHTML('beforeend',`<div class="cookie-banner" id="cookies-rm"><p><strong>Privacidade e cookies.</strong> Usamos armazenamento local essencial para manter seus pedidos e preferências neste navegador. Você pode aceitar ou recusar o armazenamento opcional.</p><button class="btn btn-outline" onclick="cookieChoiceRM('essential')">Somente essenciais</button><button class="btn" onclick="cookieChoiceRM('all')">Aceitar</button></div>`)}
function cookieChoiceRM(v){localStorage.setItem('rm_cookie_choice',v);document.getElementById('cookies-rm')?.remove()}
const previousRenderRM=render;
render=function(){previousRenderRM();if(page==='advertise')document.querySelector('main.container').innerHTML=advertisePage();const nav=document.querySelector('.nav');if(nav&&!nav.innerHTML.includes('Quero anunciar'))nav.insertAdjacentHTML('beforeend','<button onclick="navigate(\'advertise\')">Quero anunciar</button>');if(page==='home')initHero();else clearInterval(heroTimer)};

/* R&M v5 — dedicated product page, purposeful transitions and 60-second Pix window */
let rmPaymentStart=0,rmPaymentTick=null,rmBusy=false,rmLastPage='home';
function rmLoading(label='Preparando sua experiência...',delay=550,action){if(rmBusy)return;rmBusy=true;document.getElementById('rm-loading-root')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rm-loading-root" class="rm-loading" role="status" aria-live="polite"><div class="rm-loading-mark">R&M</div><span>${safe(label)}</span><div class="rm-progress"></div><small>Um momento especial está chegando</small></div>`);setTimeout(()=>{try{action?.()}finally{document.getElementById('rm-loading-root')?.remove();rmBusy=false}},delay)}
function rmProductPage(){const p=prod(selected);if(!p)return '<div class="page"><h2>Presente não encontrado</h2><button class="btn" onclick="navigate(\'home\')">Voltar à loja</button></div>';const c=company(p.store);return `<div class="rm-detail"><div class="rm-breadcrumb"><button onclick="navigate('home')">Início</button><i class="fa-solid fa-chevron-right"></i><span>${safe(p.category||'Presentes')}</span><i class="fa-solid fa-chevron-right"></i><span>${safe(p.name)}</span></div><div class="rm-detail-grid"><div><img class="rm-detail-image" src="${safe(p.img)}" alt="${safe(p.name)}"><p class="muted-note"><i class="fa-solid fa-location-dot"></i> ${safe(storeCity(p.store))} · Disponível na empresa parceira</p></div><div class="rm-detail-info"><span class="editorial-kicker">${safe(p.tag||'PRESENTE ESPECIAL')}</span><h1>${safe(p.name)}</h1><div class="store"><i class="fa-solid fa-circle-check" style="color:#249d94"></i> ${safe(p.store)} · Parceira R&M</div><p style="font-size:14px;line-height:1.8;color:#746f77;margin:20px 0">${safe(p.desc||'Um presente especial para criar memórias inesquecíveis.')}</p><div class="price">${money(p.price)}<small>Voucher digital · Resgate no estabelecimento</small></div><button class="btn" style="width:100%;padding:17px" onclick="rmBuyPresent('${safe(p.id)}')"><i class="fa-solid fa-gift"></i> Comprar e presentear <i class="fa-solid fa-arrow-right"></i></button><button class="btn btn-outline" style="width:100%;margin-top:10px" onclick="openStore('${safe(p.store)}')"><i class="fa-solid fa-store"></i> Conhecer a empresa</button><div class="rm-feature"><i class="fa-solid fa-ticket"></i><span>Voucher exclusivo liberado após aprovação do pedido pela empresa.</span></div><div class="rm-feature"><i class="fa-solid fa-lock"></i><span>Resgate único, mediante código de identificação do voucher.</span></div><div class="rm-feature"><i class="fa-solid fa-heart"></i><span>Após a aprovação, personalize o presente com nome e mensagem especial.</span></div></div></div><section class="rm-detail-description"><h2>Sobre este presente</h2><p>${safe(p.desc||'Uma surpresa preparada com carinho.')}</p><h2>Como funciona?</h2><p>Escolha Comprar e presentear, selecione a forma de pagamento e solicite o pedido. A empresa parceira verifica e aprova a solicitação. Depois da aprovação, você informa quem receberá o presente e gera o voucher digital exclusivo para apresentar no estabelecimento.</p><p><strong>Empresa responsável:</strong> ${safe(c.name)} · ${safe(storeCity(p.store))}. Para detalhes sobre agendamento, disponibilidade, condições e validade, consulte a empresa antes da compra.</p></section></div>`}
function rmBuyPresent(id){rmLoading('Preparando seu pedido...',650,()=>startCheckout(id))}
const rmRenderBeforeDetail=render;
render=function(){rmRenderBeforeDetail();if(page==='product'){const main=document.querySelector('main.container');if(main)main.innerHTML=rmProductPage()}};
showProduct=function(id){if(!prod(id))return;rmLoading('Abrindo os detalhes do presente...',460,()=>{selected=id;page='product';closeModal();render();window.scrollTo({top:0,behavior:'instant'})})};
const rmNavigateBeforeLoading=navigate;
navigate=function(p){if(p==='product')return;rmLoading('Carregando '+({home:'a vitrine',orders:'seus pedidos',company:'o painel da empresa',stores:'as lojas parceiras',account:'sua conta'}[p]||'a página')+'...',420,()=>rmNavigateBeforeLoading(p))};
function rmPixElapsed(){return Math.max(0,Math.floor((Date.now()-rmPaymentStart)/1000))}
function rmPixUpdate(){const seconds=Math.max(0,60-rmPixElapsed());const clock=document.getElementById('rm-pix-clock');if(!clock){clearInterval(rmPaymentTick);rmPaymentTick=null;return}clock.textContent=`00:${String(seconds).padStart(2,'0')}`;const bar=document.getElementById('rm-pix-bar');if(bar)bar.style.width=`${Math.min(100,rmPixElapsed()/60*100)}%`;const btn=document.getElementById('rm-pix-confirm');if(btn){btn.disabled=seconds>0;btn.classList.toggle('rm-btn-disabled',seconds>0);btn.innerHTML=seconds>0?`<i class="fa-solid fa-clock"></i> Aguarde ${seconds}s para confirmar`:'<i class="fa-solid fa-check"></i> Já realizei o pagamento';}if(seconds===0){clearInterval(rmPaymentTick);rmPaymentTick=null}}
const rmCheckoutBeforeTimer=checkoutRender;
checkoutRender=function(){const isPix=checkoutStep===1&&checkoutMethod==='pix';if(isPix&&!rmPaymentStart)rmPaymentStart=Date.now();rmCheckoutBeforeTimer();if(isPix){const modalEl=document.querySelector('#modal-root .modal');if(modalEl){const buttons=[...modalEl.querySelectorAll('button')];const confirm=buttons.find(b=>b.textContent.includes('Já realizei o pagamento'));if(confirm){confirm.id='rm-pix-confirm';confirm.onclick=()=>{if(rmPixElapsed()<60){toast('Aguarde o tempo de transação antes de confirmar.');return}checkoutStep=2;rmLoading('Conferindo os dados do pedido...',600,()=>checkoutRender())};confirm.insertAdjacentHTML('beforebegin',`<div class="rm-pay-wait"><i class="fa-solid fa-shield-halved" style="color:#b73d4e"></i><p>Tempo reservado para realizar sua transferência Pix</p><strong id="rm-pix-clock">01:00</strong><p>O botão de confirmação ficará disponível após 1 minuto.</p><div class="rm-pay-bar"><div id="rm-pix-bar"></div></div></div>`);clearInterval(rmPaymentTick);rmPixUpdate();if(rmPixElapsed()<60)rmPaymentTick=setInterval(rmPixUpdate,350)}}}else if(checkoutStep===0){rmPaymentStart=0;clearInterval(rmPaymentTick);rmPaymentTick=null}};
const rmStartCheckoutBeforeTimer=startCheckout;
startCheckout=function(id){rmPaymentStart=0;clearInterval(rmPaymentTick);rmPaymentTick=null;rmStartCheckoutBeforeTimer(id)};
const rmSubmitBeforeLoading=submitOrder;
submitOrder=function(){rmLoading('Registrando seu presente...',750,()=>rmSubmitBeforeLoading())};
const rmSetFilterBeforeLoading=setFilter;
setFilter=function(c){rmLoading('Buscando presentes para você...',350,()=>rmSetFilterBeforeLoading(c))};

render();cookieRM();welcomeRM();



;


/* R&M community and seller controls. Demo data lives in this browser only. */
let rmDeleted=read('deletedListings',[]);
for(const id of rmDeleted){const index=catalog.findIndex(p=>String(p.id)===String(id));if(index!==-1)catalog.splice(index,1)}
let rmVotes=read('listingVotes',{}),rmStoreVotes=read('storeVotes',{});
function rmReactionCount(key,kind){return Object.values(rmVotes).filter(v=>v.key===key&&v.kind===kind).length}
function rmVoteControls(p){const key=String(p.id),vote=rmVotes[key]||'';const good=vote==='good'?1:0,bad=vote==='bad'?1:0;return `<div class="rm-reactions"><button class="rm-vote ${vote==='good'?'active':''}" onclick="event.stopPropagation();rmVoteProduct('${safe(key)}','good')" aria-label="Curtir anúncio"><i class="fa-regular fa-thumbs-up"></i> Gostei <b>${good}</b></button><button class="rm-vote ${vote==='bad'?'active':''}" onclick="event.stopPropagation();rmVoteProduct('${safe(key)}','bad')" aria-label="Não gostei do anúncio"><i class="fa-regular fa-thumbs-down"></i> Não gostei <b>${bad}</b></button></div>`}
function rmVoteProduct(id,kind){rmVotes[id]=rmVotes[id]===kind?'':kind;save('listingVotes',rmVotes);rmRefreshView();toast('Sua avaliação foi registrada neste navegador')}
function rmStoreControl(name){const vote=!!rmStoreVotes[name];return `<button class="rm-vote rm-store-like ${vote?'active':''}" onclick="event.stopPropagation();rmVoteStore('${safe(name).replace(/'/g,'&#39;')}')"><i class="${vote?'fa-solid':'fa-regular'} fa-heart"></i> ${vote?'Empresa curtida':'Curtir empresa'} <b>${vote?1:0}</b></button>`}
function rmVoteStore(name){rmStoreVotes[name]=!rmStoreVotes[name];save('storeVotes',rmStoreVotes);rmRefreshView();toast('Preferência pela empresa atualizada')}
function rmRefreshView(){render();if(page==='product'){const el=document.querySelector('main.container');if(el)el.innerHTML=rmProductPage()}if(page==='store'){const el=document.querySelector('main.container');if(el)el.innerHTML=storePage()}}
const rmCardBeforeSocial=productCard;
productCard=function(p){return rmCardBeforeSocial(p).replace('<div class="price">',rmVoteControls(p)+'<div class="price">')};
const rmDetailBeforeSocial=rmProductPage;
rmProductPage=function(){const p=prod(selected);if(!p)return rmDetailBeforeSocial();let html=rmDetailBeforeSocial();const sectionStart=html.indexOf('<section class="rm-detail-description">');if(sectionStart>=0){html=html.slice(0,sectionStart)+`<section class="rm-detail-description"><div class="rm-universal"><div><span class="editorial-kicker">CONHEÇA O PRESENTE</span><h3>Sobre este presente</h3><p>${safe(p.desc||'Uma experiência especial, pensada para surpreender e criar boas memórias.')}</p><p>Oferecido por <strong>${safe(p.store)}</strong>, em ${safe(storeCity(p.store))}. Os detalhes específicos, horários, disponibilidade e condições de uso devem ser confirmados com a empresa responsável.</p></div><div><span class="editorial-kicker">DO PEDIDO À SURPRESA</span><h3>Como funciona</h3><ol><li>Escolha o presente e selecione <strong>Comprar e presentear</strong>.</li><li>Informe a forma de pagamento e envie sua solicitação.</li><li>A empresa analisa o pedido e confirma a disponibilidade e o pagamento.</li><li>Após a aprovação, informe o destinatário e escreva uma mensagem especial.</li><li>Baixe o voucher digital e apresente o código para resgate único no estabelecimento.</li></ol><p>O voucher só é disponibilizado após aprovação da empresa. Confirme diretamente com ela possíveis agendamentos e regras de utilização.</p></div></div></section></div>`}
html=html.replace('<div class="price">',rmVoteControls(p)+'<div class="price">');return html};
const rmStoreBeforeSocial=storePage;
storePage=function(){let html=rmStoreBeforeSocial();const marker='<div class="section-head">';const idx=html.indexOf(marker);if(idx!==-1)html=html.slice(0,idx)+`<div style="display:flex;align-items:center;gap:14px;justify-content:flex-end;margin:-10px 0 28px"><span class="rm-social-stat">Apoie os negócios da sua região</span>${rmStoreControl(selectedStore)}</div>`+html.slice(idx);return html};
function rmDeleteListing(id){const p=prod(id);if(!p||p.store!==selectedStore)return toast('Anúncio não encontrado nesta empresa');if(orders.some(o=>String(o.productId)===String(id)&&['pending','approved'].includes(o.status))){return toast('Há pedidos em aberto. Resolva-os antes de excluir o anúncio.')}if(!confirm(`Excluir definitivamente o anúncio "${p.name}" da vitrine?`))return;rmDeleted.push(String(id));save('deletedListings',rmDeleted);if(p.custom){extraProducts=extraProducts.filter(x=>String(x.id)!==String(id));save('extraProducts',extraProducts)}const idx=catalog.findIndex(x=>String(x.id)===String(id));if(idx!==-1)catalog.splice(idx,1);render();toast('Anúncio excluído da vitrine')}
removeProduct=rmDeleteListing;
productManager=function(){const list=catalog.filter(p=>p.store===selectedStore);return `<div class="panel"><span class="editorial-kicker">GESTÃO DE CATÁLOGO</span><h3 style="margin-top:9px">Meus anúncios <small style="font-size:13px;color:#999">(${list.length})</small></h3><p class="subtitle">Edite suas ofertas, acompanhe as reações e retire anúncios da vitrine.</p><button class="btn" onclick="productForm()"><i class="fa-solid fa-plus"></i> Criar anúncio</button>${list.length?list.map(p=>`<div class="manage-item"><img src="${safe(p.img)}" alt=""><div><strong>${safe(p.name)}</strong><small>${safe(typeTitle[typeOf(p)])} · ${money(p.price)}</small><div class="rm-dashboard-stat"><span class="rm-social-stat"><i class="fa-regular fa-thumbs-up"></i> ${rmVotes[String(p.id)]==='good'?1:0} curtidas positivas</span><span class="rm-social-stat"><i class="fa-regular fa-thumbs-down"></i> ${rmVotes[String(p.id)]==='bad'?1:0} negativas</span></div></div><div style="display:flex;gap:7px;flex-wrap:wrap">${p.custom?`<button class="btn btn-outline btn-small" onclick="productForm('${safe(p.id)}')">Editar</button>`:''}<button class="btn btn-outline btn-small rm-delete" onclick="rmDeleteListing('${safe(p.id)}')"><i class="fa-regular fa-trash-can"></i> Excluir</button></div></div>`).join(''):'<p class="subtitle" style="margin-top:30px">Nenhum anúncio ativo nesta empresa.</p>'}</div>`};
render();

/* R&M v7 — refinements */
const rmBannerImagesV7=[
 'https://www.riopretoshopping.com.br/thumb/media/noticias/03/15/banner-atenn-ca.jpg__w940_h458',
 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdwAFFz5MA8RqT2rEP0t1GGQNyKTNUi5l8j8M8AaNvkw&s=10'
];
heroRM=function(){if(!firstVisitBannerRM)return '';const i=heroIndex%rmBannerImagesV7.length;return `<section class="hero"><div class="rm-hero-photo"><img src="${rmBannerImagesV7[i]}" alt="Campanha visual R&M" onerror="this.style.opacity='.15'"><div class="hero-dots">${rmBannerImagesV7.map((_,n)=>`<button aria-label="Ver banner ${n+1}" class="${i===n?'active':''}" onclick="setHero(${n})"></button>`).join('')}</div></div></section>`};
function rmCounts(p){const v=rmVotes[String(p.id)];return {good:v==='good'?1:0,bad:v==='bad'?1:0}}
function rmCardCounters(p){const v=rmCounts(p);return `<div class="rm-card-likes" aria-label="Avaliações do anúncio"><span><i class="fa-solid fa-heart"></i> ${v.good}</span><span class="negative"><i class="fa-solid fa-heart-crack"></i> ${v.bad}</span></div>`}
productCard=function(p){return rmCardBeforeSocial(p).replace('<div class="price">',rmCardCounters(p)+'<div class="price">')};
rmVoteControls=function(p){const key=String(p.id),v=rmCounts(p),vote=rmVotes[key]||'';return `<div class="rm-reactions"><button class="rm-vote ${vote==='good'?'active':''}" onclick="rmVoteProduct('${safe(key)}','good')"><i class="fa-solid fa-heart"></i> Gostei <b>${v.good}</b></button><button class="rm-vote ${vote==='bad'?'active':''}" onclick="rmVoteProduct('${safe(key)}','bad')"><i class="fa-solid fa-heart-crack"></i> Não gostei <b>${v.bad}</b></button></div>`};
function rmCustomerUnread(){if(!session)return 0;const seen=read('customerSeenV7',{});return myOrders().filter(o=>seen[o.id]!==o.status).length}
function rmMerchantUnread(){const seen=read('merchantSeenV7',{});return orders.filter(o=>o.store===selectedStore&&seen[o.id]!==o.status).length}
function rmMarkOrdersRead(){if(!session)return;const seen=read('customerSeenV7',{});myOrders().forEach(o=>seen[o.id]=o.status);save('customerSeenV7',seen)}
function rmMarkMerchantRead(){const seen=read('merchantSeenV7',{});orders.filter(o=>o.store===selectedStore).forEach(o=>seen[o.id]=o.status);save('merchantSeenV7',seen)}
function rmBadge(n){return n?`<span class="rm-notification"><em>${n>99?'99+':n}</em></span>`:''}
function rmInjectBadges(){const customer=rmCustomerUnread(),merchant=rmMerchantUnread();document.querySelectorAll('.head-actions .action,.mobile-nav button').forEach(b=>{const t=b.textContent.trim();let n=0;if(/Meus pedidos|Pedidos/.test(t))n=customer;else if(/Minha empresa|Empresa/.test(t))n=merchant;const i=b.querySelector('i');if(i&&n){i.classList.add('rm-notification-anchor');i.insertAdjacentHTML('afterend',`<span class="rm-notification"><em>${n>99?'99+':n}</em></span>`)}})}
const rmRenderV7=render;
render=function(){rmRenderV7();if(page==='company')document.querySelector('main.container').innerHTML=companyPage();if(page==='advertise')document.querySelector('main.container').innerHTML=advertisePage();rmInjectBadges()};
const rmNavV7=navigate;
navigate=function(p){if(p==='orders')rmMarkOrdersRead();if(p==='company')rmMarkMerchantRead();rmNavV7(p)};
function rmDashSwitch(t){dashTab=t;if(t==='orders')rmMarkMerchantRead();render();window.scrollTo({top:0,behavior:'smooth'})}
function rmMerchantShell(content){const all=orders.filter(o=>o.store===selectedStore),pending=all.filter(o=>o.status==='pending').length,products=catalog.filter(p=>p.store===selectedStore).length;const nav=[['overview','fa-chart-line','Visão geral'],['products','fa-box-open','Meus anúncios'],['orders','fa-receipt','Pedidos'],['redeem','fa-qrcode','Validar voucher'],['settings','fa-sliders','Configurações']];return `<div class="page rm-merchant-page"><div class="rm-dash-top"><div><span class="editorial-kicker">CENTRAL DO PARCEIRO</span><h1>Painel da empresa</h1><p>Gerencie anúncios, pedidos e resgates em um só lugar.</p><div style="margin-top:15px"><select class="rm-dash-select" aria-label="Empresa selecionada" onchange="selectedStore=this.value;render()">${storeNames.map(n=>`<option ${n===selectedStore?'selected':''}>${safe(n)}</option>`).join('')}</select></div></div><button class="btn" onclick="productForm()"><i class="fa-solid fa-plus"></i> Adicionar produto</button></div><div class="rm-dash"><aside class="rm-dash-aside"><h3>Área de gestão</h3>${nav.map(([id,ic,name])=>`<button class="${dashTab===id?'active':''}" onclick="rmDashSwitch('${id}')"><i class="fa-solid ${ic}"></i>${name}${id==='orders'&&pending?`<span class="nav-count">${pending}</span>`:''}</button>`).join('')}</aside><div class="rm-dash-main">${content}</div></div></div>`}
companyPage=function(){const all=orders.filter(o=>o.store===selectedStore),pending=all.filter(o=>o.status==='pending'),products=catalog.filter(p=>p.store===selectedStore),redeemed=all.filter(o=>o.status==='redeemed');let content='';if(dashTab==='overview'){content=`<div class="rm-dash-stats"><div class="rm-dash-stat"><i class="fa-solid fa-box-open"></i><strong>${products.length}</strong><span>Anúncios ativos</span></div><div class="rm-dash-stat"><i class="fa-solid fa-bag-shopping"></i><strong>${all.length}</strong><span>Pedidos recebidos</span></div><div class="rm-dash-stat"><i class="fa-solid fa-clock"></i><strong>${pending.length}</strong><span>Aguardando aprovação</span></div><div class="rm-dash-stat"><i class="fa-solid fa-ticket"></i><strong>${redeemed.length}</strong><span>Vouchers resgatados</span></div></div><div class="rm-dash-panel"><h2>Acesso rápido</h2><p class="subtitle">As ferramentas mais importantes do seu negócio.</p><div class="rm-dash-actions"><button onclick="productForm()"><i class="fa-solid fa-square-plus"></i>Criar anúncio<small>Publique uma nova oferta</small></button><button onclick="rmDashSwitch('orders')"><i class="fa-solid fa-clipboard-check"></i>Gerenciar pedidos<small>${pending.length} aguardando análise</small></button><button onclick="rmDashSwitch('redeem')"><i class="fa-solid fa-qrcode"></i>Validar voucher<small>Confira o código do cliente</small></button></div></div><div class="rm-dash-panel"><div class="rm-manager-head"><h2>Pedidos recentes</h2><button class="text-link" onclick="rmDashSwitch('orders')">Ver todos</button></div>${all.length?all.slice(0,4).map(companyOrderCard).join(''):'<p class="subtitle">Os novos pedidos aparecerão aqui.</p>'}</div>`}
else if(dashTab==='products')content=productManager();
else if(dashTab==='orders')content=`<div class="rm-dash-panel"><h2>Pedidos da empresa</h2><p class="subtitle">Aprove ou recuse solicitações e acompanhe o histórico.</p>${all.length?all.map(companyOrderCard).join(''):'<p>Nenhum pedido recebido.</p>'}</div>`;
else if(dashTab==='redeem')content=`<div class="rm-dash-panel"><h2>Validar voucher</h2><p class="subtitle">Digite o código informado pelo cliente ou use a câmera para ler o QR Code.</p><form onsubmit="findVoucher(event)"><div class="field"><label>Código do voucher</label><input id="voucher-code" name="code" placeholder="RMV-XXXXXXXXXXXX" required></div><button class="btn">Buscar voucher</button> <button class="btn btn-outline" type="button" onclick="startScanner()"><i class="fa-solid fa-camera"></i> Escanear</button></form><div id="scanner-area" style="margin-top:18px"></div></div>`;
else {const c=company(selectedStore),pay=getPayment(selectedStore);content=`<div class="rm-dash-panel"><h2>Configurações da loja</h2><p class="subtitle">Atualize o perfil, os pagamentos e as informações comerciais.</p><div class="settings-tabs">${[['profile','Perfil'],['payment','Pagamentos'],['contact','Contato']].map(([id,n])=>`<button class="${settingsTab===id?'active':''}" onclick="settingsTab='${id}';render()">${n}</button>`).join('')}</div><form onsubmit="saveAdvancedCompany(event)">${settingsTab==='profile'?`<div class="field"><label>Nome da empresa</label><input name="name" required value="${safe(c.name)}"></div><div class="field"><label>URL da logomarca</label><input name="logo" value="${safe(c.logo||'')}"></div><div class="field"><label>Descrição da empresa</label><textarea name="description" rows="4">${safe(c.description)}</textarea></div>`:settingsTab==='contact'?`<div class="field"><label>WhatsApp</label><input name="phone" value="${safe(c.phone)}"></div><div class="field"><label>Endereço</label><input name="address" value="${safe(c.address)}"></div><div class="field"><label>Cidade</label><select name="city">${cityNames.map(x=>`<option ${storeCity(selectedStore)===x?'selected':''}>${x}</option>`).join('')}</select></div>`:`<div class="field"><label>Chave Pix</label><input name="pix" value="${safe(pay.pix)}"></div><div class="field"><label>Recebedor</label><input name="receiver" value="${safe(pay.receiver)}"></div><div class="field"><label>Banco</label><input name="bank" value="${safe(pay.bank)}"></div><label class="check-line"><input type="checkbox" name="cash" ${pay.cash?'checked':''}> Aceitar dinheiro presencialmente</label><label class="check-line"><input type="checkbox" name="credit" ${pay.credit?'checked':''}> Aceitar cartão de crédito presencialmente</label>`}<button class="btn">Salvar alterações</button></form></div>${settingsTab==='profile'?logoSettings():''}`}
return rmMerchantShell(content)};
productManager=function(){const list=catalog.filter(p=>p.store===selectedStore);return `<div class="rm-dash-panel"><div class="rm-manager-head"><div><h2>Meus anúncios (${list.length})</h2><p class="subtitle">Acompanhe avaliações e gerencie o catálogo.</p></div><button class="btn" onclick="productForm()"><i class="fa-solid fa-plus"></i> Novo anúncio</button></div>${list.length?list.map(p=>{const v=rmCounts(p);return `<div class="manage-item"><img src="${safe(p.img)}" alt=""><div><strong>${safe(p.name)}</strong><small>${safe(typeTitle[typeOf(p)])} · ${money(p.price)}</small><div class="rm-card-likes"><span><i class="fa-solid fa-heart"></i> ${v.good}</span><span class="negative"><i class="fa-solid fa-heart-crack"></i> ${v.bad}</span></div></div><div style="display:flex;gap:7px;flex-wrap:wrap">${p.custom?`<button class="btn btn-outline btn-small" onclick="productForm('${safe(p.id)}')">Editar</button>`:''}<button class="btn btn-outline btn-small rm-delete" onclick="rmDeleteListing('${safe(p.id)}')"><i class="fa-solid fa-trash"></i> Excluir</button></div></div>`}).join(''):'<p class="subtitle">Nenhum anúncio ativo. Publique seu primeiro produto.</p>'}</div>`};
const rmAutoTags={Gastronomia:'Sabor & Amor',Doces:'Doçura que Encanta',Confeitaria:'Feito com Carinho',Bebidas:'Brinde Especial',Moda:'Estilo de Presente',Beleza:'Um Mimo de Cuidado',Flores:'Flores & Afeto',Tecnologia:'Conexões Especiais',Artesanato:'Feito à Mão',Serviços:'Cuidado Especial',Outros:'Escolha Especial'};
function rmAutomaticTag(kind,branch){return kind==='vouchers'?'Liberdade de Escolher':kind==='experiences'?'Momento Inesquecível':rmAutoTags[branch]||'Escolha Especial'}
productForm=function(id){const p=id?prod(id):null;modal(`<h2>${p?'Editar anúncio':'Novo anúncio'}</h2><p>Crie uma oferta com informações claras. A R&M escolhe automaticamente o selo ideal.</p><form onsubmit="saveProductRM(event,'${id||''}')"><div class="form-grid"><div class="field"><label>Tipo de anúncio</label><select name="kind" id="rm-kind" onchange="rmTagPreview()"><option value="products" ${p&&typeOf(p)==='products'?'selected':''}>Produto</option><option value="experiences" ${p&&typeOf(p)==='experiences'?'selected':''}>Experiência</option><option value="vouchers" ${p&&typeOf(p)==='vouchers'?'selected':''}>Vale-compras</option></select></div><div class="field"><label>Ramo do produto</label><select name="branch" id="rm-branch" onchange="rmTagPreview()">${Object.keys(rmAutoTags).map(x=>`<option ${p?.branch===x?'selected':''}>${x}</option>`).join('')}</select></div></div><div class="rm-form-hint">Selo criado automaticamente: <strong id="rm-tag-preview">${safe(rmAutomaticTag(p?typeOf(p):'products',p?.branch||'Gastronomia'))}</strong></div><div class="field"><label>Nome do anúncio</label><input name="name" maxlength="90" required value="${safe(p?.name||'')}"></div><div class="field"><label>Preço (R$)</label><input name="price" type="number" min="0.01" step="0.01" required value="${p?.price||''}"></div><div class="field"><label>Descrição completa</label><textarea name="desc" rows="4" required>${safe(p?.desc||'')}</textarea></div><div class="field"><label>Imagem do anúncio</label><input type="file" accept="image/png,image/jpeg,image/webp" id="new-product-image"><p class="muted-note">JPG, PNG ou WebP de até 1,5 MB.</p></div><button class="btn" style="width:100%">${p?'Salvar alterações':'Publicar anúncio'}</button></form>`,true)};
function rmTagPreview(){const k=document.getElementById('rm-kind')?.value,b=document.getElementById('rm-branch')?.value;const e=document.getElementById('rm-tag-preview');if(e)e.textContent=rmAutomaticTag(k,b)}
saveProductRM=async function(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));try{const img=await imageData(document.getElementById('new-product-image'));let p=id?extraProducts.find(x=>String(x.id)===String(id)):null;if(id&&!p)return toast('Este anúncio não pode ser editado.');if(!p){p={id:'custom-'+uid(),store:selectedStore,custom:true};extraProducts.push(p);catalog.push(p)}Object.assign(p,{name:d.name.trim(),price:Number(d.price),desc:d.desc.trim(),branch:d.branch,tag:rmAutomaticTag(d.kind,d.branch),category:d.kind==='vouchers'?'Vale-compras':d.kind==='experiences'?'Experiências':'Produtos',img:img||p.img||photo('photo-1549465220-1a8b9238cd48')});save('extraProducts',extraProducts);closeModal();render();toast('Anúncio salvo com sucesso')}catch(err){toast(err.message||'Não foi possível salvar o anúncio')}};
advertisePage=function(){return `<div class="page"><div class="merchant-cta"><div><span class="editorial-kicker" style="color:#f0b1b8">PARA EMPRESAS E EMPREENDEDORES</span><h2>Transforme seus produtos em presentes memoráveis.</h2><p>Na R&M, seu negócio pode anunciar produtos, experiências e vales-compras para quem deseja surpreender alguém especial.</p></div><i class="fa-solid fa-store" style="font-size:75px;opacity:.24"></i></div><div class="section-head"><div><span class="editorial-kicker">ENTENDA A JORNADA</span><h2>Como funciona para sua empresa</h2><p>Da publicação ao resgate, acompanhe cada etapa.</p></div></div><div class="rm-steps"><div class="rm-step"><b>01</b><h3>Prepare o perfil da loja</h3><p>Cadastre os dados comerciais, endereço, WhatsApp, descrição e logomarca. Configure a chave Pix e as formas de pagamento aceitas.</p></div><div class="rm-step"><b>02</b><h3>Publique suas ofertas</h3><p>Escolha entre produto, experiência ou vale-compras. Informe o ramo, nome, preço, descrição e imagem. A plataforma sugere automaticamente um selo relacionado à categoria.</p></div><div class="rm-step"><b>03</b><h3>Receba e avalie pedidos</h3><p>Quando alguém escolhe um presente, a solicitação aparece no painel da empresa. Confira a disponibilidade e o pagamento antes de aprovar ou recusar.</p></div><div class="rm-step"><b>04</b><h3>Libere o presente digital</h3><p>Após a aprovação, o comprador informa o destinatário e gera um voucher com código exclusivo. O presenteado apresenta esse código na loja.</p></div><div class="rm-step"><b>05</b><h3>Valide o resgate</h3><p>Use a área de vouchers para consultar o código ou ler o QR Code, verificar os dados e registrar o resgate, evitando reutilização.</p></div><div class="rm-step"><b>06</b><h3>Acompanhe os resultados</h3><p>Veja pedidos, anúncios ativos, avaliações positivas e negativas e vouchers resgatados. Edite suas ofertas ou retire anúncios quando necessário.</p></div></div><div class="rm-dash-panel"><h2>O que sua empresa pode anunciar?</h2><p class="subtitle">Doces, flores, moda, beleza, gastronomia, serviços, experiências, produtos artesanais e vale-compras, entre outras opções compatíveis com a proposta da plataforma.</p><p class="muted-note">A confirmação do Pix é realizada pela empresa. Para operações integradas, é necessário cadastro comercial, autenticação, banco de dados e integração de pagamentos.</p><button class="btn" onclick="dashTab='overview';navigate('company')">Acessar painel <i class="fa-solid fa-arrow-right"></i></button></div></div>`};

/* V8: permanent campaign banners, reviews, support and safer layout */
heroRM=function(){const i=((heroIndex%rmBannerImagesV7.length)+rmBannerImagesV7.length)%rmBannerImagesV7.length;return `<section class="hero"><div class="rm-hero-photo"><img src="${safe(rmBannerImagesV7[i])}" alt="Campanha R&M ${i+1}" referrerpolicy="no-referrer" onerror="rmBannerFallback(this,${i})"><div class="hero-dots">${rmBannerImagesV7.map((_,n)=>`<button type="button" aria-label="Mostrar banner ${n+1}" class="${i===n?'active':''}" onclick="setHero(${n})"></button>`).join('')}</div></div></section>`};
function rmBannerFallback(img,i){if(img.dataset.fallback)return;img.dataset.fallback='1';img.src=i===0?'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1400&q=85':'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1400&q=85'}
initHero=function(){clearInterval(heroTimer);if(page==='home')heroTimer=setInterval(()=>{if(page==='home')setHero(heroIndex+1)},5500)};
const rmHomeV8=home;
home=function(){let h=rmHomeV8();if(!h.includes('rm-hero-photo'))h=heroRM()+h;return h};
const rmProductCardV8=productCard;
productCard=function(p){return rmProductCardV8(p).replace('<div class="price">','<div class="price"><small class="rm-price-intro">Por apenas</small>')};
const rmDetailV8=rmProductPage;
rmProductPage=function(){let html=rmDetailV8();html=html.replace('<div class="price">','<div class="price"><small class="rm-price-intro">Por apenas</small>');const p=prod(selected);if(!p)return html;const c=rmCounts(p),total=c.good+c.bad;const score=total?Math.round(c.good/total*100):0;const summary=`<div class="rm-rating-summary"><div><strong><i class="fa-solid fa-heart"></i> ${c.good}</strong><span> avaliações positivas</span></div><div><strong><i class="fa-solid fa-heart-crack"></i> ${c.bad}</strong><span> avaliações negativas</span></div><div><strong>${total?score+'%':'—'}</strong><span> aprovação ${total?'dos votos':'sem avaliações'}</span></div></div>`;const anchor='<div class="rm-reactions">';const idx=html.indexOf(anchor);if(idx>=0)html=html.slice(0,idx)+summary+html.slice(idx);else html=html.replace('<div class="price">',summary+'<div class="price">');return html};
function rmSupportOpen(){const phone=read('supportPhoneV8','');modal(`<div class="rm-support-modal"><h2><i class="fa-brands fa-whatsapp" style="color:#16875d"></i> R&M</h2><p>Precisa de ajuda com um pedido, voucher ou anúncio? Nossa equipe pode atender você pelo WhatsApp.</p>${phone?`<p><strong>WhatsApp do suporte:</strong> ${safe(phone)}</p><button class="btn" style="width:100%;background:#16875d" onclick="rmSupportWhatsApp()"><i class="fa-brands fa-whatsapp"></i> Conversar com o suporte</button>`:`<div class="demo">O número oficial de atendimento da R&M ainda não foi informado. Configure-o abaixo para ativar o link do suporte.</div><div class="field"><label>WhatsApp oficial R&M (com DDI e DDD)</label><input id="rm-support-number" inputmode="tel" placeholder="5589999999999"></div><button class="btn" style="width:100%" onclick="rmSupportSave()">Salvar WhatsApp do suporte</button><p class="rm-support-note">Configuração salva neste navegador.</p>`}</div>`)}
function rmSupportSave(){const el=document.getElementById('rm-support-number');const number=(el?.value||'').replace(/\D/g,'');if(number.length<12||number.length>15)return toast('Informe DDI, DDD e número válido');save('supportPhoneV8',number);rmSupportOpen();toast('WhatsApp de suporte configurado')}
function rmSupportWhatsApp(){const number=String(read('supportPhoneV8','')).replace(/\D/g,'');if(!number)return rmSupportOpen();window.open('https://wa.me/'+number+'?text='+encodeURIComponent('Olá! Preciso de suporte da R&M.'),'_blank','noopener,noreferrer')}
const rmRenderBeforeV8=render;
render=function(){rmRenderBeforeV8();const app=document.getElementById('app');if(!app)return;if(page==='home'&&!document.querySelector('.rm-hero-photo')){const main=app.querySelector('main.container');if(main)main.insertAdjacentHTML('afterbegin',heroRM())}if(!document.getElementById('rm-support-button')){document.body.insertAdjacentHTML('beforeend','<button id="rm-support-button" class="rm-support" onclick="rmSupportOpen()" aria-label="R&M pelo WhatsApp"><i class="fa-brands fa-whatsapp"></i><span>R&M</span></button>')}if(page==='home')initHero()};
render();




;


/* R&M V9: gift vouchers, expiry, discovery and shareable storefronts */
const rmV9Days=30;
const rmV9Date=d=>new Date(d).toLocaleDateString('pt-BR');
function rmV9Expiry(o){const base=o.approvedAt||o.created||new Date().toISOString();const d=new Date(base);d.setDate(d.getDate()+rmV9Days);return d}
function rmV9Expired(o){return !!o&&o.status==='approved'&&Date.now()>rmV9Expiry(o).getTime()}
function rmV9Status(o){if(o.status==='redeemed')return 'Resgatado';if(rmV9Expired(o))return 'Expirado';return statusText(o.status)}
const rmV9UpdateOrder=updateOrder;
updateOrder=function(id,status){const o=orders.find(x=>x.id===id);if(o&&o.status==='pending'&&status==='approved'){o.approvedAt=new Date().toISOString()}rmV9UpdateOrder(id,status)};
const rmV9Redeem=redeemVoucher;
redeemVoucher=function(id){const o=orders.find(x=>x.id===id);if(rmV9Expired(o))return toast('Voucher expirado. O resgate não é permitido.');return rmV9Redeem(id)};
findVoucher=function(e){e.preventDefault();const code=String(new FormData(e.target).get('code')||'').trim().toUpperCase();const o=orders.find(x=>x.voucher===code&&x.store===selectedStore);if(!o)return toast('Voucher não encontrado para esta loja');const p=prod(o.productId);const valid=o.status==='approved'&&!!o.recipient&&!rmV9Expired(o);modal(`<h2>Validação do presente</h2><div class="voucher-preview"><i class="fa-solid fa-gift" style="font-size:38px;color:var(--red)"></i><h3>${safe(p?.name||'Presente')}</h3><div class="code">${safe(o.voucher)}</div><p>Presenteado: <b>${safe(o.recipient?.name)}</b></p><p>Validade: ${rmV9Date(rmV9Expiry(o))}</p><span class="status">${rmV9Status(o)}</span></div>${valid?`<button class="btn" style="width:100%" onclick="redeemVoucher('${o.id}')">Confirmar resgate único</button>`:'<div class="demo">Voucher indisponível: utilizado, expirado ou ainda não liberado.</div>'}`)};
function rmV9GiftDocument(o){const p=prod(o.productId),exp=rmV9Date(rmV9Expiry(o)),issue=rmV9Date(o.approvedAt||o.created);const title=safe(p?.name||'Presente especial');return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Presente R&M - ${safe(o.voucher)}</title><style>*{box-sizing:border-box}body{margin:0;background:#eee9e2;font-family:Arial,sans-serif;color:#30282b;padding:32px 12px}.wrap{max-width:660px;margin:auto}.gift{position:relative;background:#fffdfa;border:1px solid #e3d6d0;box-shadow:0 22px 65px #3d252521;overflow:hidden}.top{background:#813748;color:white;padding:42px 45px 36px;position:relative}.top:after{content:'✦';position:absolute;right:38px;top:20px;color:#eac5ab;font-size:74px;opacity:.65}.brand{font-size:30px;font-weight:900;letter-spacing:-2px}.brand small{display:block;font-size:9px;letter-spacing:3px;font-weight:500;margin-top:5px}.eyebrow{letter-spacing:3px;font-size:10px;text-transform:uppercase;margin-top:35px;color:#f2c6bd}.top h1{font-family:Georgia,serif;font-size:clamp(32px,7vw,49px);line-height:1.08;margin:12px 0 5px;font-weight:400}.content{padding:40px 45px}.label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#a14a57;font-weight:bold}.recipient{font-family:Georgia,serif;font-size:32px;margin:8px 0 25px;overflow-wrap:anywhere}.present{padding:23px;border:1px solid #eadbd5;background:#fbf5f1;margin:18px 0}.present h2{font-family:Georgia,serif;font-size:27px;font-weight:400;margin:8px 0}.message{font-family:Georgia,serif;font-size:18px;font-style:italic;line-height:1.6;color:#715960;white-space:pre-wrap}.ticket{margin-top:30px;border-top:1px dashed #c7aca9;padding-top:26px;text-align:center}.code{font-size:clamp(18px,5vw,27px);font-weight:800;letter-spacing:3px;overflow-wrap:anywhere;margin:12px 0}.meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:26px;font-size:12px;line-height:1.6}.meta strong{display:block;color:#813748}.foot{font-size:11px;line-height:1.7;color:#857e7a;margin-top:27px}.actions{text-align:center;padding:22px}button{border:0;background:#813748;color:white;padding:13px 22px;font-weight:bold;cursor:pointer}.expired{color:#9c3232;font-weight:bold}@media(max-width:500px){.top,.content{padding:26px 23px}.meta{grid-template-columns:1fr}.recipient{font-size:27px}}@media print{body{background:#fff;padding:0}.gift{box-shadow:none}.actions{display:none}@page{margin:10mm}}</style></head><body><div class="wrap"><div class="gift"><div class="top"><div class="brand">R&amp;M<small>EXPERIÊNCIAS &amp; PRESENTES</small></div><div class="eyebrow">Uma surpresa feita para você</div><h1>Você ganhou um presente especial.</h1></div><div class="content"><div class="label">Preparado especialmente para</div><div class="recipient">${safe(o.recipient.name)}</div><div class="label">Seu presente</div><div class="present"><h2>${title}</h2><div>${safe(o.store)}</div></div>${o.recipient.message?`<div class="label">Uma mensagem de carinho</div><p class="message">“${safe(o.recipient.message)}”</p>`:''}<div class="ticket"><div class="label">Código exclusivo de resgate</div><div class="code">${safe(o.voucher)}</div><div class="label">Apresente este código na empresa parceira</div></div><div class="meta"><div><strong>Emitido em</strong>${issue}</div><div><strong>Válido até</strong>${exp}</div><div><strong>Local de resgate</strong>${safe(o.store)}</div><div><strong>Uso</strong>Único e pessoal</div></div><p class="foot">Este presente pode ser resgatado uma única vez até a data de validade. Após o resgate ou vencimento, o voucher não poderá mais ser utilizado. Sujeito às condições do estabelecimento parceiro.</p></div></div><div class="actions"><button onclick="window.print()">Imprimir ou salvar como PDF</button></div></div>

</body></html>`}
downloadVoucher=function(id){const o=orders.find(x=>x.id===id&&x.userId===session?.id);if(!o?.recipient)return toast('Voucher indisponível');if(o.status==='redeemed')return toast('Este voucher já foi resgatado e não pode ser baixado novamente.');if(rmV9Expired(o))return toast('Este voucher expirou e não está mais disponível.');if(o.status!=='approved')return toast('O voucher ainda não está liberado.');const blob=new Blob([rmV9GiftDocument(o)],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Presente-RM-'+String(o.voucher||o.id).replace(/[^\w-]/g,'')+'.html';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)};
const rmV9OrdersBefore=ordersPage;
ordersPage=function(){let html=rmV9OrdersBefore();for(const o of myOrders()){const action=`onclick="downloadVoucher('${o.id}')"`;if(o.status==='redeemed'||rmV9Expired(o)||o.status==='rejected'){const idx=html.indexOf(action);if(idx!==-1){const start=html.lastIndexOf('<button',idx),end=html.indexOf('</button>',idx)+9;if(start>=0&&end>=9)html=html.slice(0,start)+html.slice(end)}}const statusTextNow=rmV9Status(o);if(o.status==='redeemed'||rmV9Expired(o)){const marker=`${safe(o.number)}`;const idx=html.indexOf(marker);if(idx!==-1){const near=html.indexOf('<div class="order-actions">',idx);if(near!==-1)html=html.slice(0,near)+`<span class="rm-v9-order-note">${o.status==='redeemed'?'Presente já utilizado. Download encerrado.':'Validade encerrada. Voucher indisponível.'}</span>`+html.slice(near)}}else if(o.status==='approved'){const marker=`${safe(o.number)}`;const idx=html.indexOf(marker);if(idx!==-1){const near=html.indexOf('<div class="order-actions">',idx);if(near!==-1)html=html.slice(0,near)+`<span class="rm-v9-order-note">Voucher válido até ${rmV9Date(rmV9Expiry(o))} · Resgate único</span>`+html.slice(near)}}}return html};
const rmV9GiftMessage=giftMessage;
giftMessage=function(o){return rmV9GiftMessage(o)+'\nValidade do presente: '+rmV9Date(rmV9Expiry(o))+' (uso único).'};
const rmV9DetailBefore=rmProductPage;
rmProductPage=function(){let html=rmV9DetailBefore();const p=prod(selected);if(!p)return html;html=html.replaceAll('Voucher digital · Resgate no estabelecimento','Voucher digital para usar na loja parceira').replaceAll('Presente digital · Resgate na loja','Voucher digital para resgate na loja');const note='<div class="rm-feature"><i class="fa-solid fa-calendar-check"></i><span>Validade de 90 dias após a aprovação do pedido. Após o vencimento, o voucher expira e não poderá ser resgatado.</span></div>';const idx=html.indexOf('<div class="rm-feature">');if(idx!==-1)html=html.slice(0,idx)+note+html.slice(idx);const others=shuffle(catalog.filter(x=>String(x.id)!==String(p.id))).slice(0,9);const rec=`<section class="rm-v9-recs"><div class="section-head"><div><span class="editorial-kicker">MAIS IDEIAS PARA PRESENTEAR</span><h2>Você também pode gostar</h2><p>Outros presentes e experiências selecionados para surpreender.</p></div></div><div class="shelf-track">${others.map(productCard).join('')}</div></section>`;return html+rec};
const rmV9CardBefore=productCard;
productCard=function(p){return rmV9CardBefore(p).replaceAll('Presente digital · Resgate na loja','Voucher digital para resgate na loja').replaceAll('Voucher digital · Resgate no estabelecimento','Voucher digital para resgate na loja')};
let rmV9StoreSearch='';
function rmV9StoreFilter(v){rmV9StoreSearch=v;const g=document.getElementById('rm-v9-store-results');if(g)g.innerHTML=rmV9StoreCards()}
function rmV9StoreCards(){const q=rmV9StoreSearch.toLocaleLowerCase('pt-BR').trim();const matches=storeNames.filter(s=>(s+' '+(company(s)?.description||'')+' '+(company(s)?.address||'')).toLocaleLowerCase('pt-BR').includes(q));return matches.length?matches.map(s=>{const p=catalog.find(x=>x.store===s);return `<article class="product" onclick="openStore('${safe(s)}')"><div class="product-photo"><img loading="lazy" src="${safe(p?.img||'')}" alt="${safe(s)}"></div><div class="product-body"><div class="store"><i class="fa-solid fa-circle-check"></i> Loja parceira</div><h3>${safe(s)}</h3><p style="font-size:12px;color:#777">${catalog.filter(x=>x.store===s).length} presentes disponíveis</p><button class="btn">Conhecer a loja <i class="fa-solid fa-arrow-right"></i></button></div></article>`}).join(''):'<div class="rm-v9-empty">Nenhuma loja encontrada. Tente outro nome.</div>'}
storesPage=function(){return `<div class="page"><h1 class="page-title">Lojas parceiras</h1><p class="subtitle">Busque pelo nome da empresa ou pelo que ela oferece.</p><label class="rm-v9-search"><i class="fa-solid fa-magnifying-glass"></i><input aria-label="Buscar lojas" placeholder="Buscar lojas parceiras..." value="${safe(rmV9StoreSearch)}" oninput="rmV9StoreFilter(this.value)"></label><div class="products" id="rm-v9-store-results">${rmV9StoreCards()}</div></div>`};
function rmV9StoreUrl(s){const base=location.href.split('#')[0];return base+'#loja='+encodeURIComponent(s)}
function rmV9ShareStore(){const url=rmV9StoreUrl(selectedStore);if(navigator.share){navigator.share({title:'Conheça '+selectedStore+' na R&M',url}).catch(()=>{})}else copyText(url)}
function rmV9CopyStore(){copyText(rmV9StoreUrl(selectedStore))}
function rmV9SharePanel(){return `<div class="rm-dash-panel"><span class="editorial-kicker">DIVULGUE SUA VITRINE</span><h2 style="margin-top:8px">Link da sua loja</h2><p class="subtitle">Compartilhe com seus clientes para que conheçam seus presentes.</p><div class="rm-v9-share"><input readonly aria-label="Link da loja" value="${safe(rmV9StoreUrl(selectedStore))}" onclick="this.select()"><button class="btn" onclick="rmV9CopyStore()"><i class="fa-solid fa-copy"></i> Copiar link</button><button class="btn btn-outline" onclick="rmV9ShareStore()"><i class="fa-solid fa-share-nodes"></i> Compartilhar</button></div><p class="muted-note">Compartilhe o endereço do presente com quem você deseja surpreender.</p></div>`}
const rmV9CompanyBefore=companyPage;
companyPage=function(){let html=rmV9CompanyBefore();const marker='<div class="rm-dash-main">';const idx=html.indexOf(marker);if(idx>=0)html=html.slice(0,idx+marker.length)+rmV9SharePanel()+html.slice(idx+marker.length);return html};
function rmV9OpenDeepLink(){const m=location.hash.match(/^#loja=(.+)$/);if(!m)return;let s;try{s=decodeURIComponent(m[1])}catch{return}if(storeNames.includes(s)){selectedStore=s;page='store';render()}}
window.addEventListener('hashchange',rmV9OpenDeepLink);
const rmV9RenderBefore=render;
render=function(){rmV9RenderBefore();document.body.classList.toggle('rm-v9-no-header-search',page!=='home')};
rmV9OpenDeepLink();render();


;


/* Keep prices visually clean in both card templates and the full detail view. */
function rmV10CleanPrice(html){
 return html.replace(/(<div class="price"[^>]*>)([\s\S]*?)(<\/div>)/g,(_whole,open,inner,close)=>open+inner.replace(/<small\b[^>]*>[\s\S]*?<\/small>/gi,'').replace(/<span\b[^>]*class="[^"]*rm-v9-redemption[^"]*"[^>]*>[\s\S]*?<\/span>/gi,'')+close);
}
const rmV10CardBefore=productCard;
productCard=function(p){return rmV10CleanPrice(rmV10CardBefore(p))};
const rmV10DetailBefore=rmProductPage;
rmProductPage=function(){return rmV10CleanPrice(rmV10DetailBefore())};
render();


;


/* R&M V12: contextual history, order confirmations, gift experience and QR validation. */
const rm12History=[];
let rm12Current={page,selected,selectedStore,filter,searchTerm},rm12Returning=false,rm12Locked=false;
const rm12Key=s=>JSON.stringify([s.page,s.selected,s.selectedStore]);
const rm12RenderBefore=render;
render=function(){
 const next={page,selected,selectedStore,filter,searchTerm};
 if(!rm12Returning&&rm12Key(next)!==rm12Key(rm12Current)){
  rm12History.push({...rm12Current});if(rm12History.length>35)rm12History.shift();
 }
 rm12Current={...next};rm12RenderBefore();
 const main=document.querySelector('#app main')||document.querySelector('#app .page')||document.querySelector('#app .rm-detail');
 if(page!=='home'&&main&&!main.querySelector('.rm12-back')){
  main.insertAdjacentHTML('afterbegin',`<button type="button" class="rm12-back" onclick="rm12Back()"><i class="fa-solid fa-arrow-left"></i><span>Voltar</span></button>`);
 }
};
function rm12Back(){
 closeModal();if(typeof stopScanner==='function')stopScanner();
 const prev=rm12History.pop();rm12Returning=true;
 if(prev){page=prev.page;selected=prev.selected;selectedStore=prev.selectedStore;filter=prev.filter;searchTerm=prev.searchTerm}
 else {page='home';filter='Todos';searchTerm=''}
 render();rm12Returning=false;window.scrollTo({top:0,behavior:'smooth'});
}
function rm12Confirm(title,description,yes,action,destructive=false){
 modal(`<div class="rm12-confirm"><div class="rm12-confirm-icon"><i class="fa-solid fa-circle-question"></i></div><h2>${safe(title)}</h2><p>${safe(description)}</p><div class="rm12-confirm-actions"><button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn ${destructive?'rm12-danger':''}" onclick="${action}">${safe(yes)}</button></div></div>`);
}
const rm12UpdateBefore=updateOrder;
updateOrder=function(id,status){
 const o=orders.find(x=>x.id===id);
 if(!o||o.store!==selectedStore||o.status!=='pending')return toast('Pedido não disponível.');
 if(!rm12Locked){
  rm12Confirm(status==='approved'?'Aceitar este pedido?':'Recusar este pedido?',status==='approved'?'Confirma que o pagamento e a disponibilidade foram conferidos?':'Confirma que deseja recusar o pedido? Esta ação não poderá ser desfeita.',status==='approved'?'Sim, aceitar':'Sim, recusar',`rm12CommitOrder('${id}','${status}')`,status!=='approved');return;
 }
 return rm12UpdateBefore(id,status);
};
function rm12CommitOrder(id,status){closeModal();rmLoading(status==='approved'?'Confirmando aprovação...':'Registrando recusa...',750,()=>{rm12Locked=true;try{updateOrder(id,status)}finally{rm12Locked=false}})}
const rm12SaveRecipientBefore=saveRecipient;
saveRecipient=function(e,id){
 e.preventDefault();const form=e.target;
 if(!form.reportValidity())return;
 const o=orders.find(x=>x.id===id);
 if(!o||o.status!=='approved'||o.recipient)return toast('Presente indisponível.');
 const d=Object.fromEntries(new FormData(form));if(String(d.phone||'').replace(/\D/g,'').length<10)return toast('Informe um WhatsApp válido.');
 const snapshot={name:d.name,phone:d.phone,message:d.message||''};
 closeModal();rmLoading('Preparando um presente inesquecível...',1350,()=>{
  const target=orders.find(x=>x.id===id);
  if(!target||target.recipient||target.status!=='approved')return toast('Não foi possível gerar este voucher.');
  target.recipient=snapshot;
  let code;do{code='RM-'+Math.random().toString(36).slice(2,8).toUpperCase()}while(orders.some(x=>x.voucher===code));
  target.voucher=code;save('orders',orders);render();rm12Reveal(id);
 });
};
function rm12Reveal(id){
 const o=orders.find(x=>x.id===id);if(!o)return;
 const p=prod(o.productId);
 modal(`<div class="rm12-reveal"><div class="rm12-spark">✦ &nbsp; ✧ &nbsp; ✦</div><div class="rm12-gift"><i class="fa-solid fa-gift"></i></div><div class="editorial-kicker">UM MOMENTO ESPECIAL COMEÇA AQUI</div><h2>Seu presente está pronto!</h2><p>Uma surpresa preparada com carinho para <b>${safe(o.recipient.name)}</b>.</p><div class="rm12-reveal-name">${safe(p?.name||'Presente especial')}</div><div class="rm12-reveal-code">${safe(o.voucher)}</div><button class="btn" style="width:100%" onclick="downloadVoucher('${o.id}')"><i class="fa-solid fa-gift"></i> Abrir meu voucher</button><button class="btn btn-outline" style="width:100%;margin-top:9px" onclick="closeModal()">Ver meus pedidos</button></div>`);
}
const rm12RedeemBefore=redeemVoucher;
redeemVoucher=function(id){
 const o=orders.find(x=>x.id===id);
 if(!o||o.store!==selectedStore||o.status!=='approved'||!o.recipient||rmV9Expired(o))return toast('Voucher inválido, expirado ou já utilizado.');
 if(!rm12Locked){rm12Confirm('Deseja resgatar esse voucher?',`Confirme o resgate único de ${o.voucher} para ${o.recipient.name}. Após confirmar, não será possível utilizar novamente.`,'Sim, resgatar',`rm12CommitRedeem('${id}')`);return}
 return rm12RedeemBefore(id);
};
function rm12CommitRedeem(id){closeModal();rmLoading('Validando e resgatando voucher...',1150,()=>{rm12Locked=true;try{redeemVoucher(id)}finally{rm12Locked=false}})}
const rm12FindBefore=findVoucher;
findVoucher=function(e){
 e.preventDefault();const code=String(new FormData(e.target).get('code')||'').trim().toUpperCase().match(/(?:RMV?|RM)-[A-Z0-9]+/i)?.[0]||String(new FormData(e.target).get('code')||'').trim().toUpperCase();
 const form=document.createElement('form'),input=document.createElement('input');input.name='code';input.value=code;form.append(input);
 rmLoading('Verificando autenticidade e validade...',900,()=>rm12FindBefore({preventDefault(){},target:form}));
};
const rm12GiftBefore=rmV9GiftDocument;
rmV9GiftDocument=function(o){
 let html=rm12GiftBefore(o);
 const qr='https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data='+encodeURIComponent('R&M VOUCHER: '+o.voucher);
 const insert=`<div style="text-align:center;margin:20px auto 12px"><img src="${qr}" alt="QR Code para validar o voucher" width="190" height="190" style="display:block;margin:auto;max-width:100%;background:white;padding:8px;border:1px solid #eadbd5"><p style="font-size:11px;color:#857e7a">A empresa pode escanear este QR Code no painel de validação.</p></div>`;
 html=html.replace('<div class="code">'+safe(o.voucher)+'</div>',insert+'<div class="code">'+safe(o.voucher)+'</div>');
 html=html.replace('font-size:clamp(18px,5vw,27px);font-weight:800;letter-spacing:3px','font-size:clamp(15px,4vw,20px);font-weight:800;letter-spacing:2px');
 html=html.replace('</style></head>',`@keyframes rm12GiftEnter{from{opacity:0;transform:translateY(35px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes rm12Shine{0%,100%{opacity:.55}50%{opacity:1}}.gift{animation:rm12GiftEnter .9s cubic-bezier(.2,.8,.2,1) both}.top:after{animation:rm12Shine 2.5s infinite}@media(prefers-reduced-motion:reduce){.gift,.top:after{animation:none}}</style></head>`);
 return html;
};
const rm12DownloadBefore=downloadVoucher;
downloadVoucher=function(id){rmLoading('Criando seu voucher especial...',800,()=>rm12DownloadBefore(id))};
render();



;


/* V13 — demo-only persistence, privacy, confirmations and feedback. */
const rm13DraftKey='rm_checkout_draft_v13';
const rm13Social={whatsapp:'',instagram:''}; // Configure links oficiais HTTPS aqui. Sem links inventados.
function rm13GetDraft(){try{const d=JSON.parse(localStorage.getItem(rm13DraftKey)||'null');if(!d||!session||d.userId!==session.id||!prod(d.productId)||Date.now()-d.updated>7*86400000)return null;return d}catch{return null}}
function rm13SaveDraft(){if(!session||!prod(selected))return;const d={userId:session.id,productId:selected,method:checkoutMethod,step:checkoutStep,updated:Date.now(),payDetail:window.payDetail||''};try{localStorage.setItem(rm13DraftKey,JSON.stringify(d))}catch{}}
function rm13ClearDraft(){try{localStorage.removeItem(rm13DraftKey)}catch{}}
function rm13BuyerBox(){const u=currentUser();if(!u)return '';return `<div class="rm13-buyer"><h3><i class="fa-regular fa-user"></i> Dados de quem está comprando</h3><div class="rm13-buyer-row"><span>Nome</span><strong>${safe(u.name||'Não informado')}</strong></div><div class="rm13-buyer-row"><span>E-mail</span><strong>${safe(u.email||'Não informado')}</strong></div><small style="display:block;margin-top:9px;color:#8b817a">Dados da sua conta. Não compartilhe informações de pagamento por mensagens.</small></div>`}
const rm13CheckoutBefore=checkoutRender;
checkoutRender=function(){rm13CheckoutBefore();rm13SaveDraft();const m=document.querySelector('#modal-root .modal');if(m&&!m.querySelector('.rm13-buyer')){const buttons=m.querySelectorAll('button');const last=[...buttons].find(x=>x.textContent.includes('Continuar')||x.textContent.includes('Solicitar pedido'));if(last)last.insertAdjacentHTML('beforebegin',rm13BuyerBox());else m.insertAdjacentHTML('beforeend',rm13BuyerBox())}}
const rm13StartBefore=startCheckout;
startCheckout=function(id){rm13StartBefore(id);if(session&&selected===id)rm13SaveDraft()};
function rm13Resume(){const d=rm13GetDraft();if(!d)return toast('Não há pagamento pendente para continuar.');selected=d.productId;checkoutMethod=d.method==='cash'?'cash':'pix';checkoutStep=Math.max(0,Math.min(2,Number(d.step)||0));window.payDetail=d.payDetail||'';if(typeof rmPaymentStart!=='undefined'){rmPaymentStart=0}checkoutRender()}
function rm13ResumeBanner(){const d=rm13GetDraft();if(!d)return '';const p=prod(d.productId);return `<div class="rm13-resume"><div><strong><i class="fa-solid fa-bag-shopping"></i> Você tem um presente em andamento</strong><p>${safe(p.name)} · ${money(p.price)}. Continue de onde parou.</p></div><button class="btn" onclick="rm13Resume()">Continuar pagamento <i class="fa-solid fa-arrow-right"></i></button></div>`}
const rm13RenderBefore=render;
render=function(){rm13RenderBefore();if(page!=='privacy'){const main=document.querySelector('#app main');if(main&&rm13GetDraft()&&!main.querySelector('.rm13-resume'))main.insertAdjacentHTML('afterbegin',rm13ResumeBanner())}}
const rm13SubmitBefore=submitOrder;
submitOrder=function(){const count=myOrders().length;const previous=rm13SubmitBefore();setTimeout(()=>{if(myOrders().length>count){rm13ClearDraft();render();rm13Celebrate('Pedido enviado!','Seu presente foi registrado e aguarda a confirmação da empresa.','fa-circle-check')}},1050);return previous};
const rm13UpdateBefore=updateOrder;
updateOrder=function(id,status){const old=orders.find(x=>x.id===id)?.status;const out=rm13UpdateBefore(id,status);if(old==='pending'&&orders.find(x=>x.id===id)?.status===status&&['approved','rejected'].includes(status)){rm13Celebrate(status==='approved'?'Pedido confirmado!':'Pedido recusado',status==='approved'?'O pedido foi aprovado. O presente já pode seguir para a próxima etapa.':'A solicitação foi recusada pela empresa.',status==='approved'?'fa-circle-check':'fa-circle-info')}return out};
const rm13RedeemBefore=redeemVoucher;
redeemVoucher=function(id){const old=orders.find(x=>x.id===id)?.status;const out=rm13RedeemBefore(id);if(old==='approved'&&orders.find(x=>x.id===id)?.status==='redeemed')rm13Celebrate('Voucher resgatado!','O presente foi utilizado com sucesso. Este código não pode ser resgatado novamente.','fa-gift');return out};
function rm13Celebrate(title,description,icon){document.getElementById('rm13-celebrate')?.remove();const colors=['#a43748','#d9b57b','#e6a0a8','#a8b9a1'];const conf=Array.from({length:22},(_,i)=>`<i style="--x:${(i*37)%98}%;--c:${colors[i%4]};--d:${(i%6)*.11}s"></i>`).join('');document.body.insertAdjacentHTML('beforeend',`<div class="rm13-celebrate" id="rm13-celebrate"><div class="rm13-celebrate-card"><div class="rm13-confetti">${conf}</div><div class="rm13-celebrate-icon"><i class="fa-solid ${icon}"></i></div><h2>${safe(title)}</h2><p>${safe(description)}</p><button class="btn" onclick="document.getElementById('rm13-celebrate')?.remove()">Entendi</button></div></div>`)}
const rm13FooterBefore=footer;
footer=function(){let html=rm13FooterBefore();const extra=`<div><h4>Fique por dentro</h4><p>Receba novidades sobre presentes e experiências.</p><div class="rm13-news"><form onsubmit="rm13Newsletter(event)"><input name="email" type="email" autocomplete="email" placeholder="Seu melhor e-mail" aria-label="E-mail para novidades" required><button type="submit">Ativar novidades</button></form><small>Cadastro de interesse registrado neste navegador. O envio de e-mails ainda não está habilitado.</small></div><div class="rm13-social"><button title="WhatsApp R&M" aria-label="WhatsApp R&M" onclick="rm13SocialOpen('whatsapp')"><i class="fa-brands fa-whatsapp"></i></button><button title="Instagram R&M" aria-label="Instagram R&M" onclick="rm13SocialOpen('instagram')"><i class="fa-brands fa-instagram"></i></button></div><a href="#" onclick="navigate('privacy');return false" style="margin-top:15px;text-decoration:underline">Política de Privacidade</a></div>`;html=html.replace('<div class="copyright">',extra+'<div class="copyright">');return html};
function rm13SocialOpen(kind){const url=rm13Social[kind];if(!url||!/^https:\/\//i.test(url))return toast('Canal oficial ainda não configurado.');window.open(url,'_blank','noopener,noreferrer')}
function rm13Newsletter(e){e.preventDefault();const email=String(new FormData(e.target).get('email')||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast('Informe um e-mail válido.');try{localStorage.setItem('rm13_newsletter_optin',JSON.stringify({email,at:new Date().toISOString()}));e.target.reset();toast('Preferência registrada neste dispositivo. O envio de e-mails ainda não está ativo.')}catch{toast('Não foi possível salvar sua preferência.')}}
function rm13PrivacyPage(){return `<div class="page rm13-privacy"><h1 class="page-title">Política de Privacidade</h1><p class="subtitle">Informações sobre o funcionamento da R&M. Consulte os termos e a política de privacidade para conhecer o tratamento das informações.</p><section><h2>1. Dados utilizados</h2><p>A plataforma permite informar nome, e-mail, CPF, endereço, preferências, pedidos e dados de quem recebe o presente. Nesta versão, essas informações são armazenadas no navegador utilizado.</p></section><section><h2>2. Finalidade</h2><p>Os dados permitem demonstrar cadastro, acesso à conta, pedidos, vouchers, acompanhamento de resgates e personalização da experiência.</p></section><section><h2>3. Armazenamento e segurança</h2><p>Os dados são armazenados localmente no navegador. Não há banco de dados centralizado nem autenticação de servidor, e os pagamentos não são confirmados automaticamente pela plataforma. Evite inserir informações sensíveis.</p></section><section><h2>4. Pagamentos e parceiros</h2><p>Os pagamentos devem ser confirmados diretamente com a empresa parceira. A plataforma não verifica transações bancárias automaticamente. O compartilhamento por WhatsApp depende da ação do usuário.</p></section><section><h2>5. Novidades por e-mail</h2><p>O formulário de novidades registra uma preferência somente neste navegador. Não existe disparo de newsletter nesta versão. Uma operação real exigirá serviço de envio, consentimento verificável e opção de cancelamento.</p></section><section><h2>6. Seus direitos e contato</h2><p>Antes da publicação oficial, a empresa deverá informar sua identificação, contato do responsável, prazos de retenção, terceiros envolvidos, direitos previstos na LGPD e procedimento para solicitações de acesso ou exclusão.</p></section><button class="btn btn-outline" onclick="rm12Back()"><i class="fa-solid fa-arrow-left"></i> Voltar</button></div>`}
const rm13RenderPrivacyBefore=render;
render=function(){if(page==='privacy'){const was=page;page='home';rm13RenderPrivacyBefore();page=was;const main=document.querySelector('#app main');if(main)main.innerHTML=rm13PrivacyPage();document.body.classList.add('rm-v9-no-header-search');return}rm13RenderPrivacyBefore()};
const rm13NavigateBefore=navigate;
navigate=function(p){rm13NavigateBefore(p)};
window.addEventListener('pagehide',()=>{if(document.querySelector('#modal-root .modal')&&session&&prod(selected))rm13SaveDraft()});
render();


;


/* Configuração do futuro anúncio. Preencha com URLs HTTPS oficiais quando disponíveis. */
const rm15Ad={image:'',url:''};
function rm15AdHtml(){const image=/^https:\/\//i.test(rm15Ad.image)?rm15Ad.image:'';const url=/^https:\/\//i.test(rm15Ad.url)?rm15Ad.url:'';return `<div class="rm15-ad ${url?'is-linked':''}" ${url?'role="link" tabindex="0" onclick="rm15OpenAd()" onkeydown="if(event.key===\'Enter\')rm15OpenAd()"':''} aria-label="Espaço para anúncio horizontal">${image?`<img src="${safe(image)}" alt="Publicidade" loading="lazy">`:`<div class="rm15-ad-inner"><i class="fa-regular fa-image"></i><strong>Espaço publicitário</strong><small>Leaderboard · anúncio horizontal</small></div>`}</div>`}
function rm15OpenAd(){if(/^https:\/\//i.test(rm15Ad.url))window.open(rm15Ad.url,'_blank','noopener,noreferrer')}
const rm15HomeBefore=home;
home=function(){let html=rm15HomeBefore();const start=html.indexOf('<section class="hero">');const end=html.indexOf('</section>',start);if(start>=0&&end>start)html=html.slice(0,start)+rm15AdHtml()+html.slice(end+10);return html};
/* Lista de lojas com busca e grade que se adapta a centenas de parceiros. */
let rm15StoreQuery='';
function rm15StoreList(){const names=[...new Set([...storeNames,...Object.keys(companies)])].filter(Boolean).sort((a,b)=>a.localeCompare(b,'pt-BR'));const q=rm15StoreQuery.toLocaleLowerCase('pt-BR').trim();const found=names.filter(n=>n.toLocaleLowerCase('pt-BR').includes(q));const count=document.getElementById('rm15-store-count');if(count)count.textContent=`${found.length} ${found.length===1?'loja encontrada':'lojas encontradas'}`;const grid=document.getElementById('rm15-store-grid');if(!grid)return;grid.innerHTML=found.length?found.map((name,i)=>{const p=catalog.find(x=>x.store===name);const c=company(name);return `<article class="product" tabindex="0" role="button" data-store-index="${i}" onclick="rm15OpenStore(${i})" onkeydown="if(event.key==='Enter')rm15OpenStore(${i})"><div class="product-photo">${p?`<img src="${safe(p.img)}" alt="${safe(name)}" loading="lazy">`:`<div style="height:100%;display:grid;place-items:center;background:#efe9e5;color:#a43748;font-size:40px"><i class="fa-solid fa-store"></i></div>`}</div><div class="product-body"><div class="store"><i class="fa-solid fa-circle-check"></i> ${c.verified?'Parceira verificada':'Loja parceira'}</div><h3>${safe(name)}</h3><p style="font-size:11px;color:#888">${catalog.filter(x=>x.store===name).length} opções para presentear</p><button class="btn" type="button">Ver loja <i class="fa-solid fa-arrow-right"></i></button></div></article>`}).join(''):'<div class="rm15-store-empty"><i class="fa-solid fa-magnifying-glass"></i><p>Nenhuma loja encontrada. Tente outra busca.</p></div>';window.rm15VisibleStores=found}
function rm15OpenStore(index){const name=(window.rm15VisibleStores||[])[index];if(name)openStore(name)}
const rm15StoresBefore=storesPage;
storesPage=function(){return `<div class="page"><h1 class="page-title">Lojas parceiras</h1><p class="subtitle">Explore nossas empresas e encontre o presente ideal.</p><div class="rm15-store-tools"><label class="rm15-store-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" placeholder="Buscar uma loja pelo nome..." value="${safe(rm15StoreQuery)}" oninput="rm15StoreQuery=this.value;rm15StoreList()"></label><span id="rm15-store-count" class="rm15-store-count"></span></div><div class="rm15-store-grid" id="rm15-store-grid"></div></div>`};
const rm15RenderBefore=render;
render=function(){rm15RenderBefore();if(page==='stores')rm15StoreList()};
/* Overlay celebrativo com ícones Font Awesome e confetes para estados concluídos. */
function rm15Celebrate(title,description,icon='fa-circle-check'){
 document.getElementById('rm13-celebrate')?.remove();document.getElementById('rm15-success')?.remove();
 const palette=['#a43748','#d9b57b','#e6a0a8','#9fb69d','#eee2cf'];
 const conf=Array.from({length:42},(_,i)=>`<i style="--x:${(i*47+13)%100}%;--c:${palette[i%palette.length]};--d:${(i%10)*.09}s;--r:${i*29}deg"></i>`).join('');
 document.body.insertAdjacentHTML('beforeend',`<div class="rm15-success" id="rm15-success" role="dialog" aria-modal="true" aria-label="${safe(title)}"><div class="rm15-success-card"><div class="rm15-confetti">${conf}</div><div class="rm15-success-icon"><i class="fa-solid ${safe(icon)}"></i></div><h2>${safe(title)}</h2><p>${safe(description)}</p><button class="btn" type="button" onclick="document.getElementById('rm15-success')?.remove()">Continuar <i class="fa-solid fa-arrow-right"></i></button></div></div>`);
}
rm13Celebrate=function(title,description,icon){rm15Celebrate(title,description,icon)};
/* O botão de voltar fica no fluxo do conteúdo, sem flutuar sobre o cabeçalho. */
render();


;


/* Keep the home campaign; move the advertising leaderboard to the former merchant banner position. */
const rm16PreviousHome=home;
home=function(){
 let html=rm16PreviousHome();
 const ad=rm15AdHtml();
 /* V15 had replaced the primary hero with the ad. Restore the original hero from the previous home chain. */
 if(html.includes(ad)){
  const hero=heroRM();
  html=html.replace(ad,hero);
 }
 const merchant=promoRM();
 const premium=merchant.replace('class="merchant-cta"','class="merchant-cta rm16-merchant"').replace('Anuncie produtos, experiências e vale-compras. Conquiste novos clientes e venda mais.','Transforme seus produtos e experiências em presentes inesquecíveis. Faça parte da vitrine de negócios que surpreendem.');
 /* Replace the old merchant block with the actual advertising placement. */
 const oldAt=html.lastIndexOf(merchant);
 if(oldAt>=0){
  html=html.slice(0,oldAt)+`<section class="rm16-ad-slot" aria-label="Publicidade">${ad}</section>`+html.slice(oldAt+merchant.length);
  const anchor=html.indexOf('<div id="home-shelves"></div>');
  if(anchor>=0)html=html.slice(0,anchor)+premium+html.slice(anchor);
  else html=premium+html;
 }
 return html;
};
/* Confirmation is a separate explicit user action; never mark as sent just because a popup was requested. */
function rm16NeedsConfirmation(o){return !!o&&o.status==='pending'&&!o.rm16WhatsappOpenedAt}
function rm16PendingOrders(){return session?myOrders().filter(rm16NeedsConfirmation):[]}
function rm16Reminder(){const n=rm16PendingOrders().length;if(!n)return '';
 return `<section class="rm16-pending" role="status"><div><strong><i class="fa-solid fa-circle-exclamation"></i> Falta confirmar seu pedido${n>1?'s':''}</strong><p>Você tem ${n} ${n===1?'pedido aguardando':'pedidos aguardando'} a abertura do WhatsApp. Finalize para enviar a solicitação à empresa.</p></div><button class="btn" onclick="navigate('orders')">Ir para meus pedidos <i class="fa-solid fa-arrow-right"></i></button></section>`;
}
function rm16Message(o){const p=prod(o.productId),u=currentUser();return `Olá, ${o.store}! Gostaria de confirmar meu pedido na R&M.\n\nPedido: ${o.number}\nCliente: ${u?.name||'Cliente'}\nPresente: ${p?.name||'Presente'}\nValor: ${money(o.price)}\nPagamento: ${o.payment}\n\nPor favor, confirme a disponibilidade e os próximos passos.`.replace(/\n/g,'\n')}
function rm16WhatsAppUrl(o){const phone=String(company(o.store)?.phone||'').replace(/\D/g,'');if(phone.length<10||phone.length>15)return null;const number=phone.length<=11?'55'+phone:phone;return 'https://wa.me/'+number+'?text='+encodeURIComponent(rm16Message(o))}
function rm16FinalizeOrder(id){const o=orders.find(x=>String(x.id)===String(id));if(!o||!session||o.userId!==session.id)return toast('Pedido não encontrado na sua conta.');
 if(!rm16NeedsConfirmation(o))return toast('Este pedido já teve o WhatsApp aberto para confirmação.');
 const url=rm16WhatsAppUrl(o);
 if(!url){toast('A empresa ainda não cadastrou um WhatsApp válido. O pedido continuará pendente.');return}
 /* Direct same-tab navigation avoids popup blockers and gives the user an actual handoff. */
 o.rm16WhatsappOpenedAt=new Date().toISOString();save('orders',orders);
 window.location.assign(url);
}
function rm16FinalizeCard(o){const p=prod(o.productId);return `<div class="rm16-finalize"><div class="rm16-finalize-icon"><i class="fa-solid fa-circle-check"></i></div><h2>Pedido registrado!</h2><p>Seu pedido foi salvo. Agora falta uma etapa obrigatória: <strong>abrir o WhatsApp e enviar a mensagem para a empresa.</strong></p><div class="rm16-finalize-details"><strong>${safe(p?.name||'Presente')}</strong><span>Pedido ${safe(o.number)} · ${money(o.price)}</span></div><button class="btn rm16-confirm-btn" onclick="rm16FinalizeOrder('${safe(String(o.id))}')"><i class="fa-brands fa-whatsapp"></i> Finalizar pedido no WhatsApp</button><small>Se você sair agora, poderá continuar em Meus pedidos. A confirmação da empresa e o pagamento são etapas independentes.</small>${!rm16WhatsAppUrl(o)?'<p class="rm16-missing-phone">A empresa precisa cadastrar um número de WhatsApp válido para habilitar o envio.</p>':''}</div>`}
/* Override the old automatic redirect: record first, then show the mandatory handoff card. */
submitOrder=function(){const p=prod(selected),u=currentUser();if(!p||!u)return toast('Entre na sua conta para concluir o pedido.');
 const o={id:uid(),number:'RM-'+Date.now().toString().slice(-8),userId:u.id,productId:p.id,store:p.store,price:p.price,payment:checkoutMethod==='pix'?'Pix (declarado)':window.payDetail||'Presencial',status:'pending',created:new Date().toISOString(),recipient:null,voucher:null,rm16WhatsappOpenedAt:null};
 orders.unshift(o);save('orders',orders);if(typeof rm13ClearDraft==='function')rm13ClearDraft();closeModal();navigate('orders');
 modal(rm16FinalizeCard(o));
};
/* Order list includes a persistent recovery button, even after refresh or browser closure. */
const rm16OrdersBefore=ordersPage;
ordersPage=function(){let html=rm16OrdersBefore();if(!session)return html;
 const missing=rm16PendingOrders();
 for(const o of missing){
  const target=`<p>${safe(o.store)} · ${safe(o.number)} ·`;
  const at=html.indexOf(target);
  if(at>=0){const actionAt=html.indexOf('<div class="order-actions">',at);
   if(actionAt>=0){const insert=actionAt+'<div class="order-actions">'.length;
    html=html.slice(0,insert)+`<button class="btn btn-small rm16-confirm-btn" onclick="rm16FinalizeOrder('${safe(String(o.id))}')"><i class="fa-brands fa-whatsapp"></i> Confirmar pedido</button>`+html.slice(insert);
   }
  }
 }
 const heading='<p class="subtitle">Acompanhe cada surpresa, do pedido ao resgate.</p>';
 return html.replace(heading,heading+rm16Reminder());
};
const rm16RenderBefore=render;
render=function(){rm16RenderBefore();if(page!=='orders'&&page!=='privacy'){
 const main=document.querySelector('#app main');if(main&&rm16PendingOrders().length&&!main.querySelector('.rm16-pending'))main.insertAdjacentHTML('afterbegin',rm16Reminder());
 }};
render();


;


/* V17: preserve all prior storefront behavior while refining the journey. */
const rm17HomeBefore=home;
home=function(){
 let html=rm17HomeBefore();
 // Remove the obsolete wide promotional banner, not the advertising placement.
 html=html.replace(/<div class="wide-promo"><div><h2>Presentear pode ser simples\.<\/h2>[\s\S]*?<\/button><\/div>/,'');
 // The merchant call-to-action belongs immediately after the advertising space near the footer.
 const merchantStart=html.indexOf('<section class="merchant-cta rm16-merchant"');
 const adStart=html.indexOf('<section class="rm16-ad-slot"');
 if(merchantStart>=0&&adStart>=0){
  const merchantEnd=html.indexOf('</section>',merchantStart);
  if(merchantEnd>=0){
   let merchant=html.slice(merchantStart,merchantEnd+10).replace('rm16-merchant','rm16-merchant rm17-merchant-below');
   html=html.slice(0,merchantStart)+html.slice(merchantEnd+10);
   const ad=html.indexOf('<section class="rm16-ad-slot"');
   const adEnd=html.indexOf('</section>',ad);
   if(ad>=0&&adEnd>=0)html=html.slice(0,adEnd+10)+merchant+html.slice(adEnd+10);
  }
 }
 return html;
};
/* Dismissing a saved checkout explicitly abandons the draft; do not affect submitted orders. */
function rm17DiscardDraft(){
 if(typeof rm13ClearDraft==='function')rm13ClearDraft();
 const el=document.querySelector('.rm13-resume');if(el)el.remove();
 toast('Tudo bem! Esse presente em andamento foi descartado.');
}
rm13ResumeBanner=function(){
 const d=rm13GetDraft();if(!d)return '';
 const p=prod(d.productId);if(!p)return '';
 return `<div class="rm13-resume rm17-draft"><div><strong><i class="fa-solid fa-gift"></i> Uma surpresa esperando por você</strong><p>${safe(p.name)} · ${money(p.price)}. Seu carinho está guardado aqui. Continue quando quiser.</p></div><button class="btn" onclick="rm13Resume()">Continuar meu presente <i class="fa-solid fa-arrow-right"></i></button><button class="rm17-draft-close" aria-label="Descartar presente em andamento" title="Descartar presente em andamento" onclick="rm17DiscardDraft()">&times;</button></div>`;
};
/* Replace the former checkout call to action and give each step warmer copy. */
const rm17CheckoutBefore=checkoutRender;
checkoutRender=function(){
 rm17CheckoutBefore();
 const m=document.querySelector('#modal-root .modal');if(!m)return;
 const title=m.querySelector('h2');
 if(title&&/Finalizar presente/i.test(title.textContent))title.textContent='Falta pouco para transformar carinho em surpresa.';
 const intro=m.querySelector('h2 + p');
 if(intro&&/Escolha como deseja/i.test(intro.textContent))intro.textContent='Escolha como prefere cuidar desse momento especial. Estamos preparando tudo com carinho.';
 for(const b of m.querySelectorAll('button')){
  if(/Solicitar pedido/i.test(b.textContent))b.innerHTML='Salvar meu pedido <i class="fa-solid fa-gift"></i>';
 }
 const note=m.querySelector('.demo');
 if(note&&/WhatsApp abrirá/i.test(note.textContent))note.textContent='Seu pedido ficará guardado com segurança neste navegador. Depois, em Meus pedidos, você poderá abrir o WhatsApp e enviar a confirmação para a empresa.';
};
/* Save first, celebrate, and take the buyer to My Orders with the required next step visible. */
submitOrder=function(){
 const p=prod(selected),u=currentUser();if(!p||!u)return toast('Entre na sua conta para preparar essa surpresa.');
 const o={id:uid(),number:'RM-'+Date.now().toString().slice(-8),userId:u.id,productId:p.id,store:p.store,price:p.price,payment:checkoutMethod==='pix'?'Pix (declarado)':window.payDetail||'Presencial',status:'pending',created:new Date().toISOString(),recipient:null,voucher:null,rm16WhatsappOpenedAt:null};
 orders.unshift(o);save('orders',orders);
 if(typeof rm13ClearDraft==='function')rm13ClearDraft();
 closeModal();navigate('orders');
 if(typeof rm15Celebrate==='function')rm15Celebrate('Seu presente está a caminho de acontecer!','Que alegria! Seu pedido foi salvo com carinho. Agora, confirme com a empresa pelo WhatsApp para dar o próximo passo.','fa-gift');
 else if(typeof rm13Celebrate==='function')rm13Celebrate('Seu pedido foi salvo!','Falta só confirmar com a empresa pelo WhatsApp.','fa-gift');
 // Keep a prominent confirmation action inside the order list, including after the celebration closes.
 const main=document.querySelector('#app main');
 if(main&&!main.querySelector('.rm17-next')){
  const next=`<div class="rm17-next"><strong><i class="fa-solid fa-heart"></i> Falta só um detalhe para essa surpresa acontecer.</strong><p>Seu pedido está guardado! Toque abaixo para abrir o WhatsApp e confirmar diretamente com a empresa.</p><button class="btn" onclick="rm16FinalizeOrder('${safe(String(o.id))}')">Confirmar meu pedido <i class="fa-solid fa-arrow-right"></i></button></div>`;
  const pending=main.querySelector('.rm16-pending');
  if(pending)pending.insertAdjacentHTML('afterend',next);else main.insertAdjacentHTML('afterbegin',next);
 }
};
/* Consistent, warm confirmation language, without claiming the WhatsApp message was sent. */
rm16FinalizeCard=function(o){const p=prod(o.productId);return `<div class="rm16-finalize"><div class="rm16-finalize-icon"><i class="fa-solid fa-gift"></i></div><h2>Falta pouco para surpreender alguém especial!</h2><p>Seu pedido já está guardado. Agora é só <strong>confirmar com a empresa pelo WhatsApp</strong> para continuar essa história.</p><div class="rm16-finalize-details"><strong>${safe(p?.name||'Um presente especial')}</strong><span>Pedido ${safe(o.number)} · ${money(o.price)}</span></div><button class="btn rm16-confirm-btn" onclick="rm16FinalizeOrder('${safe(String(o.id))}')"><i class="fa-solid fa-arrow-right"></i> Confirmar meu pedido</button><small>Você pode voltar a qualquer momento em Meus pedidos. Abrir o WhatsApp não comprova o envio da mensagem.</small></div>`};
rm16Reminder=function(){const n=rm16PendingOrders().length;if(!n)return '';return `<section class="rm16-pending" role="status"><div><strong><i class="fa-solid fa-heart"></i> ${n===1?'Seu presente só precisa de mais um passo!':'Seus presentes estão quase prontos para surpreender!'}</strong><p>${n===1?'Falta confirmar seu pedido':'Falta confirmar seus pedidos'}. Vá até Meus pedidos e abra o WhatsApp da empresa para continuar.</p></div><button class="btn" onclick="navigate('orders')">Ir para meus pedidos <i class="fa-solid fa-arrow-right"></i></button></section>`};
const rm17OrdersBefore=ordersPage;
ordersPage=function(){let html=rm17OrdersBefore();return html.replace(/<i class="fa-brands fa-whatsapp"><\/i> Confirmar pedido/g,'<i class="fa-solid fa-arrow-right"></i> Confirmar meu pedido')};
render();


;


/* V19: contact buyer, phone validation, in-person payment notice and centered leaderboard. */
function rm19PhoneDigits(v){return String(v||'').replace(/\D/g,'')}
function rm19ValidDDD(v){const n=rm19PhoneDigits(v);return /^[1-9][1-9]$/.test(n)}
function rm19ValidMobile(v){return /^9\d{8}$/.test(rm19PhoneDigits(v))}
function rm19PhoneField(){
 return `<div class="field"><label><i class="fa-brands fa-whatsapp" style="color:#16875d;font-size:16px;margin-right:5px"></i> WhatsApp do comprador</label><div class="rm19-phone"><input name="ddd" inputmode="numeric" autocomplete="tel-area-code" maxlength="2" pattern="[1-9][1-9]" required placeholder="DDD" aria-label="DDD com 2 dígitos" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,2)"><div class="rm19-number"><i class="fa-brands fa-whatsapp"></i><input name="mobile" inputmode="numeric" autocomplete="tel-national" maxlength="9" pattern="9[0-9]{8}" required placeholder="9XXXXXXXX" aria-label="Número WhatsApp com 9 dígitos" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,9)"></div></div><small class="rm19-hint">Informe o DDD do seu estado (2 dígitos) e o celular com 9 dígitos, começando por 9. Ex.: 89 + 994484966.</small></div>`;
}
const rm19ShowAuthBefore=showAuth;
showAuth=function(register=false){
 rm19ShowAuthBefore(register);
 if(!register)return;
 const form=document.querySelector('#modal-root form[onsubmit*="authSubmit"]');
 if(!form||form.querySelector('[name="ddd"]'))return;
 const email=form.querySelector('input[name="email"]')?.closest('.field');
 if(email)email.insertAdjacentHTML('beforebegin',rm19PhoneField());
};
const rm19AuthSubmitBefore=authSubmit;
authSubmit=function(e,register){
 if(!register)return rm19AuthSubmitBefore(e,register);
 const form=e.target;
 const ddd=form.querySelector('[name="ddd"]')?.value||'';
 const mobile=form.querySelector('[name="mobile"]')?.value||'';
 if(!rm19ValidDDD(ddd)||!rm19ValidMobile(mobile)){
  e.preventDefault();toast('Confira o WhatsApp: DDD com 2 dígitos e celular com 9 dígitos iniciado por 9.');return;
 }
 const before=users.length;
 rm19AuthSubmitBefore(e,register);
 if(users.length>before){
  const u=currentUser();
  if(u){u.whatsapp='55'+rm19PhoneDigits(ddd)+rm19PhoneDigits(mobile);u.phone=u.whatsapp;save('users',users);}
 }
};
function rm19TalkToBuyer(id){
 const o=orders.find(x=>String(x.id)===String(id));
 if(!o||o.store!==selectedStore){toast('Pedido não encontrado para esta empresa.');return;}
 const u=users.find(x=>x.id===o.userId);
 const raw=rm19PhoneDigits(u?.whatsapp||u?.phone||'');
 const number=raw.length===11?'55'+raw:raw;
 if(!/^55[1-9][1-9]9\d{8}$/.test(number)){toast('O comprador ainda não cadastrou um WhatsApp válido.');return;}
 const p=prod(o.productId);
 const message=`Olá, ${u.name}! Somos da ${o.store}. Estamos entrando em contato sobre seu pedido ${o.number} (${p?.name||'presente'}) na R&M.`;
 window.open('https://wa.me/'+number+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
}
const rm19CompanyOrderBefore=companyOrderCard;
companyOrderCard=function(o){
 let html=rm19CompanyOrderBefore(o);
 const u=users.find(x=>x.id===o.userId);
 const raw=rm19PhoneDigits(u?.whatsapp||u?.phone||'');
 const number=raw.length===11?'55'+raw:raw;
 const valid=/^55[1-9][1-9]9\d{8}$/.test(number);
 const btn=valid?`<button class="btn btn-small rm19-contact" onclick="rm19TalkToBuyer('${safe(String(o.id))}')"><i class="fa-brands fa-whatsapp"></i> Falar com comprador</button>`:`<button class="btn btn-outline btn-small" disabled title="Comprador sem WhatsApp cadastrado"><i class="fa-brands fa-whatsapp"></i> WhatsApp não informado</button>`;
 return html.replace('<div class="order-actions">','<div class="order-actions">'+btn);
};
const rm19AccountBefore=accountPage;
accountPage=function(){
 let html=rm19AccountBefore(),u=currentUser();
 if(u?.whatsapp){let digits=rm19PhoneDigits(u.whatsapp);html=html.replace('<p><b>Endereço:</b>',`<p><b>WhatsApp:</b> (${safe(digits.slice(2,4))}) ${safe(digits.slice(4,9))}-${safe(digits.slice(9))}</p><p><b>Endereço:</b>`);}
 return html;
};
const rm19CheckoutRenderBefore=checkoutRender;
checkoutRender=function(){
 rm19CheckoutRenderBefore();
 if(checkoutMethod!=='cash')return;
 const root=document.getElementById('modal-root');
 const modalEl=root?.querySelector('.modal');
 if(!modalEl||modalEl.querySelector('.rm19-pay-notice'))return;
 const notice=`<div class="rm19-pay-notice"><i class="fa-solid fa-circle-info"></i><strong>Pagamento presencial:</strong> após gerar o pedido, você deverá entrar em contato com a empresa parceira pelo WhatsApp para confirmar pessoalmente a disponibilidade, o valor e a forma de pagamento escolhida (à vista ou cartão de crédito). O pedido só será aprovado pela empresa após essa confirmação. Nenhum valor é cobrado pelo site.</div>`;
 const submit=modalEl.querySelector('button[onclick*="continueCheckout"],button[onclick*="submitOrder"]');
 if(submit)submit.insertAdjacentHTML('beforebegin',notice);
 else modalEl.insertAdjacentHTML('beforeend',notice);
};
const rm19HomeBefore=home;
home=function(){
 let html=rm19HomeBefore();
 return html.replace(/<section class="rm16-ad-slot"/,'<section class="rm16-ad-slot rm19-ad-centered"');
};
render();


;


/* O aviso já aparece em Meus pedidos; lá a ação correta é confirmar cada pedido. */
const rm21ReminderPrevious=rm16Reminder;
rm16Reminder=function(){
 const html=rm21ReminderPrevious();
 if(page!=='orders')return html;
 return html.replace(/<button class="btn" onclick="navigate\('orders'\)">[\s\S]*?<\/button>/,'');
};
/* O leaderboard pertence ao intervalo entre as vitrines de Experiências e Vale-compras. */
const rm21HomePrevious=home;
home=function(){
 let html=rm21HomePrevious();
 const start=html.indexOf('<section class="rm16-ad-slot');
 if(start<0)return html;
 const end=html.indexOf('</section>',start);
 if(end<0)return html;
 const ad=html.slice(start,end+10).replace('rm16-ad-slot','rm16-ad-slot rm21-ad-middle');
 html=html.slice(0,start)+html.slice(end+10);
 const showcase=html.indexOf('<div id="showcase">');
 if(showcase<0)return html;
 const sections=[...html.slice(showcase).matchAll(/<section class="shelf"/g)];
 if(sections.length<3)return html;
 const insert=showcase+sections[2].index;
 return html.slice(0,insert)+ad+html.slice(insert);
};
function rm21MaskVoucher(v){const code=String(v||'');return code?code.slice(0,2)+'*'.repeat(Math.max(6,code.length-2)):''}
/* A empresa só vê os dois primeiros caracteres no painel de pedidos. */
const rm21CompanyOrderPrevious=companyOrderCard;
companyOrderCard=function(o){
 let html=rm21CompanyOrderPrevious(o);
 if(o.voucher){
  const full=safe(String(o.voucher));
  html=html.split(full).join(safe(rm21MaskVoucher(o.voucher)));
 }
 return html;
};
/* Validação requer que o portador apresente o código completo. Após digitá-lo,
   o código continua mascarado na tela da empresa. */
const rm21FindVoucherPrevious=findVoucher;
findVoucher=function(e){
 const field=e?.target?.querySelector('[name="code"]');
 const typed=String(field?.value||'').trim().toUpperCase();
 const matched=orders.find(o=>o.voucher===typed&&o.store===selectedStore);
 if(!matched)return rm21FindVoucherPrevious(e);
 const modalBefore=modal;
 modal=function(content,...args){
  const original=safe(String(matched.voucher));
  const masked=safe(rm21MaskVoucher(matched.voucher));
  return modalBefore(String(content).split(original).join(masked),...args);
 };
 try{return rm21FindVoucherPrevious(e)}finally{modal=modalBefore}
};
render();


;


/* 12% once, on approval. Prototype accounting stored in browser localStorage. */
const rm22FeeRate=0.12;
const rm22LedgerKey='rm22_approved_commissions';
let rm22Ledger=read(rm22LedgerKey,[]);
if(!Array.isArray(rm22Ledger))rm22Ledger=[];
let rm22ShowBalance=false;
const rm22Money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function rm22Entries(store){return rm22Ledger.filter(x=>x.store===store)}
function rm22Invoice(store){const entries=rm22Entries(store);return {entries,total:Math.round(entries.reduce((sum,x)=>sum+Number(x.feeCents||0),0))/100,approved:entries.length,volume:Math.round(entries.reduce((sum,x)=>sum+Number(x.orderCents||0),0))/100}}
function rm22RecordApproval(o){
 if(!o||!o.id||rm22Ledger.some(x=>String(x.orderId)===String(o.id)))return;
 const cents=Math.round(Number(o.price||0)*100);
 if(!Number.isFinite(cents)||cents<0)return;
 const feeCents=Math.round(cents*rm22FeeRate);
 rm22Ledger.push({id:'fee-'+String(o.id),orderId:String(o.id),orderNumber:String(o.number||''),store:String(o.store||''),productName:String(prod(o.productId)?.name||'Presente'),orderCents:cents,rate:rm22FeeRate,feeCents,approvedAt:new Date().toISOString(),paymentStatus:'unpaid'});
 save(rm22LedgerKey,rm22Ledger);
}
const rm22UpdateOrderBefore=updateOrder;
updateOrder=function(id,status){
 const before=orders.find(x=>String(x.id)===String(id));
 const wasPending=before?.status==='pending';
 const result=rm22UpdateOrderBefore(id,status);
 const after=orders.find(x=>String(x.id)===String(id));
 if(wasPending&&status==='approved'&&after?.status==='approved'&&after.store===selectedStore){rm22RecordApproval(after);render()}
 return result;
};
function rm22FinanceCard(){
 const d=rm22Invoice(selectedStore),shown=rm22ShowBalance;
 return `<section class="rm22-finance" aria-label="Minha fatura R&M"><div class="rm22-finance-head"><div><div class="rm22-finance-eyebrow"><i class="fa-solid fa-wallet"></i> Minha fatura R&M</div><div class="rm22-finance-value" id="rm22-balance">${shown?rm22Money(d.total):'R$ ••••••'}</div><p class="rm22-finance-desc">Comissão de 12% por pedido aprovado</p></div><button type="button" class="rm22-finance-eye" title="${shown?'Ocultar':'Mostrar'} saldo" aria-label="${shown?'Ocultar':'Mostrar'} saldo" onclick="rm22ToggleBalance()"><i class="fa-solid ${shown?'fa-eye-slash':'fa-eye'}"></i></button></div><div class="rm22-finance-info"><span><i class="fa-solid fa-circle-check"></i> ${d.approved} ${d.approved===1?'pedido aprovado':'pedidos aprovados'}</span><span><i class="fa-solid fa-percent"></i> 12% por aprovação</span><span><i class="fa-solid fa-calendar"></i> Acumulado de comissões</span></div><div class="rm22-finance-actions"><button type="button" class="rm22-finance-secondary" onclick="rm22ShowSummary()"><i class="fa-solid fa-list-check"></i> Ver resumo</button><button type="button" class="rm22-finance-primary" onclick="rm22PayInvoice()"><i class="fa-solid fa-credit-card"></i> Pagar fatura</button></div></section>`;
}
function rm22ToggleBalance(){rm22ShowBalance=!rm22ShowBalance;const card=document.querySelector('.rm22-finance');if(card){card.outerHTML=rm22FinanceCard()}}
function rm22ShowSummary(){
 const d=rm22Invoice(selectedStore);
 const rows=d.entries.slice().reverse().map(x=>`<tr><td>${safe(x.orderNumber)}<small style="display:block;color:#888">${safe(x.productName)}</small></td><td>${new Date(x.approvedAt).toLocaleDateString('pt-BR')}</td><td>${rm22Money(x.orderCents/100)}</td><td>${rm22Money(x.feeCents/100)}</td></tr>`).join('');
 modal(`<div class="editorial-kicker">Financeiro da empresa</div><h2>Resumo da minha fatura</h2><p>${safe(selectedStore)} · Comissão de 12% cobrada uma única vez na aprovação de cada pedido.</p><div class="rm22-invoice-scroll"><table class="rm22-invoice-table"><thead><tr><th>Pedido</th><th>Aprovação</th><th>Venda</th><th>Comissão</th></tr></thead><tbody>${rows||'<tr><td colspan="4">Nenhuma comissão registrada ainda.</td></tr>'}</tbody></table></div><div class="rm22-invoice-summary"><span><strong>${d.approved}</strong> pedidos aprovados</span><strong>${rm22Money(d.total)}</strong></div><p class="rm22-invoice-note">Pedidos pendentes ou recusados não geram comissão. Resgatar um voucher não gera outra cobrança. Este resumo é armazenado neste navegador e não substitui documento fiscal ou cobrança emitida.</p><button class="btn" style="width:100%" onclick="rm22PayInvoice()">Pagar fatura <i class="fa-solid fa-arrow-right"></i></button>`,true);
}
function rm22PayInvoice(){
 const d=rm22Invoice(selectedStore);
 if(d.total<=0)return toast('Sua empresa ainda não possui comissão a pagar.');
 const number='5589994484966';
 const message=`Olá, equipe R&M! Quero solicitar os dados de pagamento e a conferência da fatura da empresa ${selectedStore}. Meu resumo de comissões indica ${d.approved} pedidos aprovados, totalizando ${rm22Money(d.total)} em comissões de 12%. Aguardo a conferência e as instruções para pagamento.`;
 modal(`<div class="editorial-kicker">Pagamento da fatura</div><h2>Vamos acertar sua fatura?</h2><p>Seu resumo de comissões registra <strong>${rm22Money(d.total)}</strong> em comissões de pedidos aprovados.</p><div class="demo"><i class="fa-solid fa-circle-info"></i> O pagamento é confirmado após conferência pela equipe R&M. Você será direcionado ao WhatsApp oficial da R&M para solicitar a conferência e os dados de pagamento. O saldo não será marcado como pago sem confirmação.</div><button class="btn" style="width:100%" onclick="window.open('https://wa.me/${number}?text='+encodeURIComponent(${JSON.stringify(message)}),'_blank','noopener,noreferrer')"><i class="fa-brands fa-whatsapp"></i> Solicitar pagamento pelo WhatsApp</button><button class="btn btn-outline" style="width:100%" onclick="rm22ShowSummary()">Voltar ao resumo</button>`);
}
const rm22CompanyPageBefore=companyPage;
companyPage=function(){let html=rm22CompanyPageBefore();const card=rm22FinanceCard();const pos=html.indexOf('<div class="rm-dash-main">');if(pos>=0)return html.slice(0,pos+'<div class="rm-dash-main">'.length)+card+html.slice(pos+'<div class="rm-dash-main">'.length);const alternative=html.indexOf('<div class="dashboard">');if(alternative>=0)return html.slice(0,alternative)+card+html.slice(alternative);return card+html};
render();


;


/* Only extends gift personalization and voucher presentation. */
const rm23Themes=[
{id:'mae',cat:'Família',name:'Amor de Mãe',line:'O amor mora nos detalhes',icon:'fa-heart',bg:'linear-gradient(145deg,#fce5e4,#efb2b8)',ink:'#7c3348',accent:'#b74667',deco:'❀'},
{id:'pai',cat:'Família',name:'Meu Herói',line:'Para quem sempre esteve aqui',icon:'fa-star',bg:'linear-gradient(145deg,#183b54,#43859b)',ink:'#ffffff',accent:'#b5dfdc',deco:'✧'},
{id:'familia',cat:'Família',name:'Laços Eternos',line:'Nossa história, nosso amor',icon:'fa-people-roof',bg:'linear-gradient(145deg,#e8d8ba,#c5a678)',ink:'#483a32',accent:'#72533c',deco:'✿'},
{id:'romance',cat:'Amores',name:'Só Nós Dois',line:'O mundo fica melhor com você',icon:'fa-heart',bg:'linear-gradient(145deg,#53182f,#b63e63)',ink:'#fff4e9',accent:'#f7bfca',deco:'♥'},
{id:'paixao',cat:'Amores',name:'Amor em Flor',line:'Um carinho que floresce',icon:'fa-seedling',bg:'linear-gradient(145deg,#fff0e5,#eab3a5)',ink:'#843c4d',accent:'#b05e69',deco:'❀'},
{id:'aniversario-amor',cat:'Amores',name:'Nossa História',line:'Mais um capítulo de nós',icon:'fa-infinity',bg:'linear-gradient(145deg,#3b314e,#89779c)',ink:'#ffffff',accent:'#e5d2f5',deco:'✦'},
{id:'amigos',cat:'Amigos',name:'Amizade de Ouro',line:'A vida é melhor com amigos',icon:'fa-face-laugh-beam',bg:'linear-gradient(145deg,#ffda70,#f5a850)',ink:'#624128',accent:'#9d5b29',deco:'☀'},
{id:'parceria',cat:'Amigos',name:'Nossa Vibe',line:'Mais histórias para contar',icon:'fa-bolt',bg:'linear-gradient(145deg,#8de0cf,#54b7c5)',ink:'#164f5a',accent:'#176477',deco:'✳'},
{id:'gratidao',cat:'Corporativo',name:'Com Gratidão',line:'Seu trabalho faz a diferença',icon:'fa-award',bg:'linear-gradient(145deg,#142c37,#31515b)',ink:'#f9e4b7',accent:'#e5c58a',deco:'✦'},
{id:'conquista',cat:'Corporativo',name:'Grande Conquista',line:'Uma conquista merece ser celebrada',icon:'fa-trophy',bg:'linear-gradient(145deg,#f4f0e6,#ded3b9)',ink:'#655039',accent:'#a07d45',deco:'✧'},
{id:'celebrar',cat:'Outros',name:'Dia de Celebrar',line:'Hoje o dia é todo seu',icon:'fa-cake-candles',bg:'linear-gradient(145deg,#e3c7fc,#f8a9c9)',ink:'#65365f',accent:'#96509d',deco:'✷'},
{id:'surpresa',cat:'Outros',name:'Surpresa Especial',line:'Tem carinho chegando!',icon:'fa-gift',bg:'linear-gradient(145deg,#f5e9d6,#cdbf9e)',ink:'#4c463e',accent:'#786342',deco:'✦'},
{id:'renovar',cat:'Outros',name:'Novos Começos',line:'Coisas lindas estão por vir',icon:'fa-sun',bg:'linear-gradient(145deg,#c8e9dc,#e8edc8)',ink:'#3a6256',accent:'#5a9177',deco:'❋'}
];
let rm23SelectedTheme='mae',rm23Filter='Todos';
function rm23Theme(id){return rm23Themes.find(x=>x.id===id)||rm23Themes[0]}
function rm23Thumb(t){return `<div class="rm23-thumb" style="--theme-bg:${t.bg};--theme-text:${t.ink}"><i class="fa-solid ${t.icon}"></i><strong>${safe(t.name)}</strong><small>${safe(t.line)}</small></div>`}
const rm23RecipientPrevious=recipientModal;
recipientModal=function(id){const o=orders.find(x=>String(x.id)===String(id));if(!o||o.status!=='approved'||o.recipient)return toast('Presente indisponível para envio');rm23SelectedTheme='mae';rm23Filter='Todos';rm23OpenGallery(id)};
function rm23OpenGallery(id){const o=orders.find(x=>String(x.id)===String(id));if(!o||o.status!=='approved'||o.recipient)return toast('Presente indisponível');
 const tabs=['Todos','Família','Amores','Amigos','Corporativo','Outros'].map(x=>`<button type="button" class="${rm23Filter===x?'active':''}" onclick="rm23Filter=${JSON.stringify(x)};rm23OpenGallery(${JSON.stringify(id)})">${x}</button>`).join('');
 const cards=rm23Themes.filter(x=>rm23Filter==='Todos'||x.cat===rm23Filter).map(t=>`<button type="button" class="rm23-choice ${rm23SelectedTheme===t.id?'selected':''}" onclick="rm23SelectedTheme=${JSON.stringify(t.id)};rm23OpenGallery(${JSON.stringify(id)})">${rm23Thumb(t)}<div class="rm23-choice-foot"><b>${safe(t.name)}</b><i class="fa-solid ${rm23SelectedTheme===t.id?'fa-circle-check':'fa-circle'}"></i></div></button>`).join('');
 modal(`<div class="rm23-shop"><div class="rm23-kicker">R&M · Ateliê de presentes</div><h2>Escolha como seu carinho vai chegar.</h2><p>Um presente especial merece uma apresentação inesquecível. Escolha a arte que vai acompanhar o voucher.</p><div class="rm23-tabs">${tabs}</div><div class="rm23-grid">${cards}</div><div class="rm23-bottom"><button class="btn btn-outline" onclick="closeModal()">Voltar</button><button class="btn" onclick="rm23OpenRecipient(${JSON.stringify(id)})">Continuar com este tema <i class="fa-solid fa-arrow-right"></i></button></div></div>`,'wide');
}
function rm23OpenRecipient(id){const t=rm23Theme(rm23SelectedTheme);const o=orders.find(x=>String(x.id)===String(id));if(!o||o.status!=='approved'||o.recipient)return toast('Presente indisponível');
 modal(`<div class="rm23-shop"><button class="rm23-stepback" onclick="rm23OpenGallery(${JSON.stringify(id)})"><i class="fa-solid fa-arrow-left"></i> Trocar o tema</button><div class="rm23-kicker">Seu presente está ganhando forma</div><h2>Agora, para quem vai essa surpresa?</h2><div class="rm23-preview">${rm23Thumb(t)}</div><p class="rm23-previewnote">Tema escolhido: <strong>${safe(t.name)}</strong> · Este visual acompanhará o voucher.</p><form onsubmit="saveRecipient(event,${JSON.stringify(id)})"><input type="hidden" name="giftTheme" value="${safe(t.id)}"><div class="field"><label>Nome completo de quem vai receber</label><input name="name" required maxlength="100" autocomplete="name"></div><div class="field"><label>WhatsApp com DDD</label><input name="phone" required minlength="10" placeholder="(89) 99999-9999" inputmode="tel"></div><div class="field"><label>Mensagem especial (opcional)</label><textarea name="message" rows="3" maxlength="600" placeholder="Escreva algo que vai tocar o coração..."></textarea></div><button class="btn" style="width:100%">Criar meu voucher especial <i class="fa-solid fa-gift"></i></button></form></div>`,'wide');
}
const rm23SavePrevious=saveRecipient;
saveRecipient=function(e,id){const o=orders.find(x=>String(x.id)===String(id));if(o&&o.status==='approved'&&!o.recipient&&e.target.reportValidity()){const t=rm23Theme(new FormData(e.target).get('giftTheme'));o.giftTheme=t.id;save('orders',orders)}return rm23SavePrevious(e,id)};
function rm23VoucherHtml(o){const p=prod(o.productId),t=rm23Theme(o.giftTheme),r=o.recipient||{},name=safe(r.name||''),msg=safe(r.message||'').replace(/\n/g,'<br>');const buyer=users.find(x=>x.id===o.userId);const from=safe(buyer?.name||'Alguém especial');return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Um presente especial para ${name}</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet"><style>*{box-sizing:border-box}body{margin:0;background:#eeeae6;color:#29242a;font-family:'DM Sans',Arial,sans-serif;padding:28px 14px}.shell{max-width:600px;margin:auto}.voucher{background:white;border-radius:22px;overflow:hidden;box-shadow:0 24px 75px #30202b25}.cover{min-height:375px;background:${t.bg};color:${t.ink};position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:65px 30px 45px;overflow:hidden}.cover:before{content:'${t.deco}';position:absolute;font-size:310px;opacity:.09;right:-45px;top:-75px}.cover:after{content:'';position:absolute;inset:22px;border:1px solid currentColor;opacity:.24;pointer-events:none;border-radius:150px 150px 10px 10px}.seal{border:1px solid currentColor;border-radius:50%;width:70px;height:70px;display:grid;place-items:center;font-size:35px;margin-bottom:26px;opacity:.9}.kicker{font-size:10px;font-weight:800;letter-spacing:4px;text-transform:uppercase;opacity:.8}.cover h1{font:600 clamp(37px,8vw,58px)/1.1 'Playfair Display',Georgia,serif;margin:18px 0;position:relative}.cover p{font-size:14px;letter-spacing:.05em;opacity:.86;position:relative}.body{padding:40px 40px 34px;text-align:center}.eyebrow{color:${t.accent};font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase}.recipient{font:600 33px 'Playfair Display',Georgia,serif;margin:14px 0}.intro{color:#7b7374;font-size:13px;line-height:1.8}.gift{border-top:1px solid #eae3df;border-bottom:1px solid #eae3df;margin:28px 0;padding:23px 5px}.gift strong{font:600 22px 'Playfair Display',Georgia,serif;display:block;margin:8px 0}.gift small{font-size:12px;color:#82777a}.message{background:#f9f6f3;border-radius:12px;padding:23px;margin:20px 0;font:italic 18px/1.6 Georgia,serif;color:#61535b;overflow-wrap:anywhere}.from{font-size:12px;color:#776f70;margin:20px 0}.ticket{background:#29272c;color:white;border-radius:12px;padding:22px 15px;margin-top:25px}.ticket span{display:block;font-size:10px;letter-spacing:2px;color:#d4c3c6;text-transform:uppercase}.ticket strong{display:block;font-size:clamp(17px,4vw,25px);letter-spacing:3px;margin:12px 0;overflow-wrap:anywhere}.ticket small{font-size:11px;color:#d6cfd1;line-height:1.6}.brand{text-align:center;margin:24px 0;font-weight:800;letter-spacing:2px;color:#6e6467;font-size:13px}.brand b{color:#a43748}.actions{text-align:center;margin:20px 0}.actions button{border:0;background:#a43748;color:white;padding:13px 22px;border-radius:9px;font-weight:800;cursor:pointer}.foot{text-align:center;font-size:11px;color:#857d7d;line-height:1.7}@media(max-width:500px){.body{padding:30px 22px}.cover{min-height:320px;padding:55px 24px}.cover h1{font-size:42px}}@media print{body{padding:0;background:white}.shell{max-width:100%}.voucher{box-shadow:none}.actions,.foot{display:none}@page{margin:0}}</style></head><body><div class="shell"><article class="voucher"><section class="cover"><div class="seal">${t.deco}</div><div class="kicker">Um gesto de carinho</div><h1>${safe(t.name)}</h1><p>${safe(t.line)}</p></section><section class="body"><div class="eyebrow">Uma surpresa só para você</div><div class="recipient">${name}</div><p class="intro">Alguém pensou em você e transformou esse sentimento em um presente de verdade.</p><div class="gift"><div class="eyebrow">Seu presente</div><strong>${safe(p?.name||'Um presente especial')}</strong><small>Oferecido por ${safe(o.store||'Empresa parceira')}</small></div>${msg?`<div class="message">“${msg}”</div>`:''}<div class="from">Com carinho, <strong>${from}</strong></div><div class="ticket"><span>Seu código exclusivo de resgate</span><strong>${safe(o.voucher||'')}</strong><small>Apresente este código à empresa parceira para utilizar seu presente. Válido conforme as condições do pedido.</small></div></section></article><div class="brand">R<b>&</b>M · PRESENTEAR É VIVER</div><div class="actions"><button onclick="window.print()">Imprimir ou salvar em PDF</button></div><p class="foot">Um presente especial merece uma lembrança especial. Guarde seu código com carinho.</p></div>

</body></html>`}
downloadVoucher=function(id){const o=orders.find(x=>String(x.id)===String(id));if(!o?.recipient||!o.voucher)return toast('Voucher indisponível.');const html=rm23VoucherHtml(o);const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='RM-Presente-'+String(o.number||o.id).replace(/[^a-z0-9-]/gi,'')+'.html';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);toast('Seu voucher temático foi baixado! Abra o arquivo para visualizar ou salvar em PDF.')};
const rm23GiftMessagePrevious=giftMessage;
giftMessage=function(o){const t=rm23Theme(o.giftTheme);return rm23GiftMessagePrevious(o)+'\n\nUm presente com o tema: '+t.name+' ✨'};


;


/* V24: correct selection events, refined stationery and merchant invoice flow. */
const rm24Palette={
 mae:['#f4e9e4','#784e53','#9c5d63'],pai:['#243b4b','#f1e9dc','#b8a68d'],familia:['#e9e0cd','#574c3e','#8b7960'],romance:['#5c2635','#f6e9df','#c9a49a'],paixao:['#f0ddd6','#7d4851','#a66e70'], 'aniversario-amor':['#34304b','#f4e9e7','#c9b7ce'],amigos:['#f0d9a4','#5b4630','#aa7b43'],parceria:['#d7e7e3','#325c60','#729d9a'],gratidao:['#203640','#e9dcc1','#c3ac7f'],conquista:['#e9e5d9','#645642','#aa9169'],celebrar:['#e9dbe7','#61465d','#9b7696'],surpresa:['#ece4d5','#5c5146','#a08b73'],renovar:['#dce7db','#486351','#8da68c']
};
rm23Themes.forEach(t=>{const p=rm24Palette[t.id];if(p){t.bg=p[0];t.ink=p[1];t.accent=p[2]}});
rm23Thumb=function(t){return `<div class="rm23-thumb" style="--theme-bg:${t.bg};--theme-text:${t.ink}"><div class="rm24-topline">R&M · Edição especial</div><div class="rm24-rule"></div><strong>${safe(t.name)}</strong><small>${safe(t.line)}</small><div class="rm24-rule"></div><div class="rm24-topline">Feito para emocionar</div></div>`};
let rm24GiftOrderId=null;
function rm24ChooseTheme(btn){const id=btn.getAttribute('data-theme');if(!rm23Themes.some(t=>t.id===id))return;rm23SelectedTheme=id;document.querySelectorAll('.rm23-choice').forEach(el=>{const on=el===btn;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));const icon=el.querySelector('.rm23-choice-foot i');if(icon)icon.className='fa-solid '+(on?'fa-circle-check':'fa-circle')});const b=document.getElementById('rm24-continue');if(b)b.disabled=false}
function rm24FilterThemes(btn){rm23Filter=btn.getAttribute('data-category')||'Todos';document.querySelectorAll('.rm23-tabs button').forEach(el=>el.classList.toggle('active',el===btn));document.querySelectorAll('.rm23-choice').forEach(el=>el.style.display=rm23Filter==='Todos'||el.getAttribute('data-category')===rm23Filter?'':'none')}
rm23OpenGallery=function(id){const o=orders.find(x=>String(x.id)===String(id));if(!o||o.status!=='approved'||o.recipient)return toast('Presente indisponível');rm24GiftOrderId=id;const tabs=['Todos','Família','Amores','Amigos','Corporativo','Outros'].map(x=>`<button type="button" data-category="${safe(x)}" class="${rm23Filter===x?'active':''}" onclick="rm24FilterThemes(this)">${safe(x)}</button>`).join('');const cards=rm23Themes.map(t=>`<button type="button" data-theme="${safe(t.id)}" data-category="${safe(t.cat)}" aria-pressed="${rm23SelectedTheme===t.id}" class="rm23-choice ${rm23SelectedTheme===t.id?'selected':''}" onclick="rm24ChooseTheme(this)" ${rm23Filter!=='Todos'&&t.cat!==rm23Filter?'style="display:none"':''}>${rm23Thumb(t)}<div class="rm23-choice-foot"><b>${safe(t.name)}</b><i class="fa-solid ${rm23SelectedTheme===t.id?'fa-circle-check':'fa-circle'}"></i></div></button>`).join('');modal(`<div class="rm23-shop"><div class="rm23-kicker">R&M · Coleção de papelaria afetiva</div><h2>Escolha a apresentação do seu presente.</h2><p>Design editorial, tipografia elegante e acabamento inspirado em convites e cartões de luxo.</p><div class="rm23-tabs">${tabs}</div><div class="rm23-grid">${cards}</div><div class="rm23-bottom"><button type="button" class="btn btn-outline" onclick="closeModal()">Voltar</button><button type="button" class="btn" id="rm24-continue" onclick="rm24ContinueGift()">Continuar com este tema <i class="fa-solid fa-arrow-right"></i></button></div></div>`,true)};
function rm24ContinueGift(){if(rm24GiftOrderId===null)return toast('Selecione um tema');rm23OpenRecipient(rm24GiftOrderId)}
rm23OpenRecipient=function(id){const t=rm23Theme(rm23SelectedTheme),o=orders.find(x=>String(x.id)===String(id));if(!o||o.status!=='approved'||o.recipient)return toast('Presente indisponível');rm24GiftOrderId=id;modal(`<div class="rm23-shop"><button type="button" class="rm23-stepback" onclick="rm24BackGallery()"><i class="fa-solid fa-arrow-left"></i> Trocar tema</button><div class="rm23-kicker">Um presente feito especialmente para alguém</div><h2>Para quem vai essa surpresa?</h2><div class="rm23-preview">${rm23Thumb(t)}</div><p class="rm23-previewnote">Modelo escolhido: <strong>${safe(t.name)}</strong></p><form id="rm24-gift-form"><input type="hidden" name="giftTheme" value="${safe(t.id)}"><div class="field"><label>Nome completo do presenteado</label><input name="name" required maxlength="100" autocomplete="name"></div><div class="field"><label>WhatsApp com DDD</label><input name="phone" required minlength="10" placeholder="(89) 99999-9999" inputmode="tel"></div><div class="field"><label>Sua mensagem especial</label><textarea name="message" rows="4" maxlength="600" placeholder="Escreva uma dedicatória inesquecível..."></textarea></div><button type="submit" class="btn" style="width:100%">Criar voucher personalizado <i class="fa-solid fa-gift"></i></button></form></div>`,true);document.getElementById('rm24-gift-form').addEventListener('submit',e=>saveRecipient(e,id))};
function rm24BackGallery(){rm23OpenGallery(rm24GiftOrderId)}
/* Pix key must be configured with a REAL key owned by R&M. Never fabricate one. */
const rm24OfficialPixKey='57293143000156'; // Chave Pix oficial informada para pagamento de faturas R&M.
const rm24OfficialWhatsapp='5589994484966';
let rm24InvoiceStarted=0,rm24InvoiceStore='',rm24InvoiceAmount=0,rm24InvoiceTimer=null;
function rm24PixField(id,value){const v=String(value);return id+String(v.length).padStart(2,'0')+v}
function rm24PixPayload(key,amount){const merchant=rm24PixField('00','BR.GOV.BCB.PIX')+rm24PixField('01',key);let s=rm24PixField('00','01')+rm24PixField('26',merchant)+rm24PixField('52','0000')+rm24PixField('53','986')+rm24PixField('54',Number(amount).toFixed(2))+rm24PixField('58','BR')+rm24PixField('59','MARLLUS VINICIUS S A')+rm24PixField('60','URUCUI')+rm24PixField('62',rm24PixField('05','***'))+'6304';let crc=0xffff;for(let i=0;i<s.length;i++){crc^=s.charCodeAt(i)<<8;for(let j=0;j<8;j++)crc=(crc&0x8000)?((crc<<1)^0x1021)&0xffff:(crc<<1)&0xffff}return s+crc.toString(16).toUpperCase().padStart(4,'0')}
function rm24InvoiceWhatsapp(kind){const now=new Date();const date=now.toLocaleDateString('pt-BR'),time=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});const amount=rm22Money(rm24InvoiceAmount);const intro=kind==='receipt'?'Olá, equipe R&M! Estou enviando a DECLARAÇÃO de que realizei o Pix da minha fatura. Solicito a conferência do comprovante e a confirmação do recebimento.':'Olá, equipe R&M! Solicito a chave Pix oficial e os dados para pagar minha fatura.';const msg=`${intro}\n\nEmpresa: ${rm24InvoiceStore}\nFatura: ${amount}\nData da declaração: ${date}\nHorário da declaração: ${time}\nForma de pagamento: Pix\n\nObservação: o envio desta mensagem NÃO comprova o pagamento. Aguardarei a verificação pela equipe R&M.`;window.open('https://wa.me/'+rm24OfficialWhatsapp+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer')}
function rm24InvoiceTick(){const left=Math.max(0,60-Math.floor((Date.now()-rm24InvoiceStarted)/1000));const clock=document.getElementById('rm24-invoice-clock');if(!clock){clearInterval(rm24InvoiceTimer);rm24InvoiceTimer=null;return}clock.textContent=`00:${String(left).padStart(2,'0')}`;const btn=document.getElementById('rm24-invoice-confirm');if(btn){btn.disabled=left>0;btn.style.opacity=left>0?'.48':'1';btn.innerHTML=left>0?`<i class="fa-regular fa-clock"></i> Aguarde ${left}s para informar o pagamento`:'<i class="fa-brands fa-whatsapp"></i> Informar pagamento via WhatsApp'}if(left===0){clearInterval(rm24InvoiceTimer);rm24InvoiceTimer=null}}
function rm24CopyPix(){const el=document.getElementById('rm24-pix-text');if(!el)return;const txt=el.textContent;navigator.clipboard?.writeText(txt).then(()=>toast('Código Pix copiado!')).catch(()=>toast('Selecione e copie o código Pix.'))}
rm22PayInvoice=function(){const d=rm22Invoice(selectedStore);if(d.total<=0)return toast('Sua empresa ainda não possui comissão a pagar.');rm24InvoiceStore=selectedStore;rm24InvoiceAmount=d.total;rm24InvoiceStarted=Date.now();const key=rm24OfficialPixKey.trim();const payload=key?rm24PixPayload(key,d.total):'';modal(`<div class="editorial-kicker">Financeiro · R&M Marketplace</div><h2>Pagamento da fatura</h2><p>Empresa: <strong>${safe(selectedStore)}</strong></p><div class="rm24-pay-card"><div class="rm24-topline">Total da fatura</div><h2 style="font-size:32px;margin:8px 0">${rm22Money(d.total)}</h2><p>${d.approved} pedido(s) aprovado(s) · comissão de 12%</p></div><div class="rm24-pay-card"><div class="rm24-topline">Dados para pagamento</div><p><strong>Chave Pix (CNPJ):</strong> 57.293.143/0001-56</p><p><strong>Banco:</strong> Mercado Pago</p><p><strong>Recebedor:</strong> MARLLUS VINICIUS S A</p><p style="font-size:11px;color:#756d69">Confira os dados do recebedor no aplicativo do seu banco antes de concluir a transferência.</p></div>${key?`<div class="rm24-qr" id="rm24-pix-qr" aria-label="QR Code Pix para pagar a fatura R&M"><span>Gerando QR Code Pix...</span></div><p style="text-align:center;font-size:12px;color:#756d69">Escaneie com o aplicativo do seu banco ou copie o código Pix abaixo.</p><div class="rm24-pix-code" id="rm24-pix-text">${safe(payload)}</div><button type="button" class="btn btn-outline" style="width:100%" onclick="rm24CopyPix()"><i class="fa-solid fa-copy"></i> Copiar Pix copia e cola</button>`:`<div class="demo"><i class="fa-solid fa-circle-info"></i> A chave Pix oficial da R&M ainda não está configurada neste arquivo. Por segurança, não exibimos QR Code fictício. Solicite a chave oficial pelo WhatsApp.</div><button type="button" class="btn rm24-wa" style="width:100%" onclick="rm24InvoiceWhatsapp('request')"><i class="fa-brands fa-whatsapp"></i> Solicitar chave Pix via WhatsApp</button>`}<div class="rm24-countdown">Disponível para informar pagamento em <strong id="rm24-invoice-clock">01:00</strong></div><div class="rm24-pay-actions"><button type="button" class="btn rm24-wa" id="rm24-invoice-confirm" disabled onclick="rm24InvoiceWhatsapp('receipt')"><i class="fa-regular fa-clock"></i> Aguarde 60s para informar o pagamento</button><button type="button" class="btn btn-outline" onclick="rm22ShowSummary()">Voltar ao resumo</button></div><p class="rm24-quiet">O botão do WhatsApp apenas envia uma declaração de pagamento. A fatura não será quitada automaticamente: a equipe R&M deverá verificar o Pix e o comprovante antes de confirmar o recebimento.</p>`,true);clearInterval(rm24InvoiceTimer);rm24InvoiceTimer=setInterval(rm24InvoiceTick,500);rm24InvoiceTick();if(key){const holder=document.getElementById('rm24-pix-qr');const draw=()=>{if(typeof QRCode!=='undefined'){holder.innerHTML='';new QRCode(holder,{text:payload,width:190,height:190,correctLevel:QRCode.CorrectLevel.M})}else holder.textContent='QR Code indisponível; use Pix copia e cola.'};if(typeof QRCode!=='undefined')draw();else{const sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';sc.onload=draw;sc.onerror=()=>{holder.innerHTML='<img alt="QR Code Pix da fatura R&M" width="190" height="190" style="max-width:100%;background:#fff;padding:8px" src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data='+encodeURIComponent(payload)+'">';};document.head.appendChild(sc)}}};


;


/* Illustrations are handcrafted CSS compositions with theme-specific symbols and subtle motion. */
const rm25Motifs={
 mae:['🌷','💐','🦋','🌸','✨'],pai:['🧭','⭐','🏔️','✦','🌟'],familia:['🏡','🌳','🤎','🍃','✧'],romance:['🌹','💌','❤️','✨','♥'],paixao:['🌺','🌿','🦋','🌷','✧'], 'aniversario-amor':['🌙','💫','⭐','✨','♡'],amigos:['🎈','🥂','🎉','☀️','✦'],parceria:['🎧','⚡','🪩','✳','🎵'],gratidao:['🏅','🌿','✨','✦','🏆'],conquista:['🏆','🎖️','⭐','✨','✦'],celebrar:['🎂','🎊','🎈','🎉','✨'],surpresa:['🎁','🎀','✨','💝','✦'],renovar:['🌱','🌤️','🦋','🍃','✨']};
function rm25Scene(t){return '<div class="rm25-scene" aria-hidden="true">'+(rm25Motifs[t.id]||rm25Motifs.surpresa).map(x=>'<span>'+x+'</span>').join('')+'</div>'}
rm23Thumb=function(t){return `<div class="rm23-thumb rm25-${t.id}" style="--theme-bg:${t.bg};--theme-text:${t.ink}">${rm25Scene(t)}<div class="rm24-topline">R&M · Um presente para você</div><div class="rm24-rule"></div><strong>${safe(t.name)}</strong><small>${safe(t.line)}</small><div class="rm24-rule"></div><div class="rm24-topline">Um momento só seu</div></div>`};
const rm25OriginalVoucher=rm23VoucherHtml;
rm23VoucherHtml=function(o){let html=rm25OriginalVoucher(o);const t=rm23Theme(o.giftTheme);const extraCSS=document.getElementById('rm-v25-art').textContent.replace(/@import[^;]*;/g,'');const font='<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&display=swap" rel="stylesheet">';html=html.replace('</head>',font+'<style>'+extraCSS+'.cover.rm25-cover{min-height:410px;display:flex;align-items:center;justify-content:center}.cover.rm25-cover::before{display:none}.cover.rm25-cover .rm25-scene{z-index:0}.cover.rm25-cover .seal{display:none}.cover.rm25-cover h1{font-family:Fraunces,Georgia,serif;z-index:2}.cover.rm25-cover .kicker,.cover.rm25-cover p{z-index:2}.cover.rm25-cover .rm25-scene span:nth-child(1){font-size:100px}.cover.rm25-cover .rm25-scene span:nth-child(2){font-size:115px}@media print{.rm25-scene span{animation:none!important}}'+'</style></head>');html=html.replace('<section class="cover">','<section class="cover rm25-cover rm25-'+t.id+'">'+rm25Scene(t));return html};


;


/* Voucher v26: full order document, product photo, timestamps, no price */
rm23Thumb=function(t){return `<div class="rm23-thumb rm26-theme" style="--theme-bg:${t.bg};--theme-text:${t.ink}"><div class="rm26-theme-label">R&M · Edição especial</div><div class="rm26-theme-rule"></div><strong>${safe(t.name)}</strong><small>${safe(t.line)}</small><div class="rm26-theme-rule"></div><div class="rm26-theme-label">Um presente para lembrar</div></div>`};
function rm26Date(v){if(!v)return 'Não informado';const d=new Date(v);return isNaN(d.getTime())?'Não informado':d.toLocaleString('pt-BR',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).replace(' às ', ' · ')}
function rm26Status(o){return o.status==='redeemed'?'Resgatado':o.status==='approved'?'Disponível para resgate':o.status==='pending'?'Aguardando confirmação':o.status==='rejected'?'Não aprovado':safe(o.status||'Não informado')}
rm23VoucherHtml=function(o){
 const p=prod(o.productId)||{},t=rm23Theme(o.giftTheme),r=o.recipient||{},buyer=users.find(x=>x.id===o.userId)||{};
 const name=safe(r.name||'Presenteado'),sender=safe(buyer.name||'Não informado'),store=safe(o.store||p.store||'Loja parceira');
 const photo=String(o.productImage||p.img||p.image||p.photo||p.imageUrl||'');
 const image=photo?`<img class="product-image" src="${safe(photo)}" alt="Imagem do presente" referrerpolicy="no-referrer">`:`<div class="product-image missing">Imagem do produto indisponível</div>`;
 const msg=safe(r.message||'').replace(/\n/g,'<br>');
 const order=safe(o.number||o.id||'Não informado'),code=safe(o.voucher||'Não emitido');
 const purchased=rm26Date(o.created),confirmed=rm26Date(o.approvedAt||o.confirmedAt||o.updatedAt),redeemed=rm26Date(o.redeemedAt);
 const status=rm26Status(o);
 return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Voucher R&M · Pedido ${order}</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,700&display=swap" rel="stylesheet"><style>
 *{box-sizing:border-box}body{margin:0;background:#eeece9;color:#26252a;font-family:'DM Sans',Arial,sans-serif;padding:32px 14px}.wrap{max-width:690px;margin:auto}.paper{background:#fff;box-shadow:0 24px 75px #241f2420;overflow:hidden;border-radius:10px}.mast{background:${t.bg};color:${t.ink};padding:38px 42px 35px;position:relative;overflow:hidden}.mast:before{content:'';position:absolute;right:-95px;top:-115px;width:310px;height:310px;border:1px solid currentColor;border-radius:50%;opacity:.15}.mast:after{content:'';position:absolute;right:-48px;top:-55px;width:195px;height:195px;border:1px solid currentColor;border-radius:50%;opacity:.12}.top{display:flex;justify-content:space-between;align-items:center;gap:12px;position:relative}.brand{font-size:21px;font-weight:800;letter-spacing:-1px}.brand small{font-size:9px;display:block;letter-spacing:2px;margin-top:3px;font-weight:600}.edition{font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:800}.mast h1{font:600 clamp(34px,7vw,52px)/1.1 Fraunces,Georgia,serif;margin:48px 0 10px;position:relative}.mast p{font-size:13px;opacity:.9;margin:0;position:relative}.inner{padding:34px 42px 39px}.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:800;color:#9b4351}.intro{font-size:14px;line-height:1.75;color:#625e62;margin:13px 0 24px}.intro strong{color:#29252a}.product{display:grid;grid-template-columns:175px minmax(0,1fr);gap:21px;align-items:center;padding:17px;background:#f8f7f5;border:1px solid #eeeae5;border-radius:7px}.product-image{width:175px;height:160px;object-fit:cover;border-radius:4px;background:#e9e5e0}.product-image.missing{display:grid;place-items:center;padding:16px;color:#8b8582;text-align:center;font-size:12px}.product h2{font:600 24px/1.22 Fraunces,Georgia,serif;margin:9px 0 10px;overflow-wrap:anywhere}.product .store{font-size:12px;color:#716b6c;line-height:1.6}.section{margin-top:30px}.section h3{font-size:13px;margin:0 0 15px;font-weight:800}.facts{display:grid;grid-template-columns:1fr 1fr;gap:16px 24px}.fact{padding:0 0 13px;border-bottom:1px solid #ece9e6;min-width:0}.fact label{display:block;font-size:10px;letter-spacing:.5px;color:#888184;margin-bottom:6px}.fact strong{display:block;font-size:12px;line-height:1.55;overflow-wrap:anywhere}.message{background:#f8f5f2;border-left:3px solid #ad6471;padding:19px 21px;margin-top:25px;font:italic 17px/1.65 Georgia,serif;color:#51454a;overflow-wrap:anywhere}.ticket{border:1px solid #ded8d5;border-radius:7px;padding:22px;margin-top:29px;text-align:center;background:#fdfcfb}.ticket .eyebrow{color:#6b6164}.ticket strong{display:block;font-size:clamp(18px,4.8vw,29px);letter-spacing:3px;margin:13px 0;overflow-wrap:anywhere}.ticket p{font-size:11px;color:#746e71;line-height:1.7;margin:0}.status{display:inline-block;margin-top:15px;font-size:11px;font-weight:800;background:#ede9e5;padding:8px 12px;border-radius:30px}.foot{padding:21px 42px;background:#f7f6f4;border-top:1px solid #ebe8e5;font-size:11px;color:#787174;line-height:1.7}.actions{text-align:center;margin:22px 0}.actions button{border:0;background:#a43748;color:#fff;padding:14px 22px;font-size:12px;font-weight:800;border-radius:5px;cursor:pointer}.hint{text-align:center;color:#817c7b;font-size:11px;line-height:1.6}@media(max-width:540px){.mast{padding:27px 24px}.mast h1{margin-top:37px}.inner{padding:27px 22px}.product{grid-template-columns:112px minmax(0,1fr);gap:13px;padding:10px}.product-image{width:112px;height:130px}.product h2{font-size:19px}.facts{gap:13px}.foot{padding:18px 22px}.edition{font-size:8px;letter-spacing:1px}}@media print{body{padding:0;background:white}.wrap{max-width:none}.paper{box-shadow:none;border-radius:0}.actions,.hint{display:none!important}@page{margin:10mm}}
 </style></head><body><div class="wrap"><article class="paper"><header class="mast"><div class="top"><div class="brand">R&M<small>PRESENTEAR É VIVER</small></div><div class="edition">Voucher de presente</div></div><h1>${safe(t.name)}</h1><p>${safe(t.line)}</p></header><main class="inner"><div class="eyebrow">Um presente especial para você</div><p class="intro"><strong>${name}</strong>, você recebeu um presente de <strong>${sender}</strong>. Veja abaixo todos os detalhes para aproveitar sua surpresa.</p><div class="product">${image}<div><div class="eyebrow">Presente adquirido</div><h2>${safe(p.name||'Presente especial')}</h2><div class="store">Oferecido por <strong>${store}</strong></div></div></div><section class="section"><h3>Detalhes do pedido</h3><div class="facts"><div class="fact"><label>Número do pedido</label><strong>${order}</strong></div><div class="fact"><label>Situação do voucher</label><strong>${status}</strong></div><div class="fact"><label>Data e hora da compra</label><strong>${purchased}</strong></div><div class="fact"><label>Loja responsável</label><strong>${store}</strong></div><div class="fact"><label>Presenteado</label><strong>${name}</strong></div><div class="fact"><label>Quem presenteou</label><strong>${sender}</strong></div>${o.status==='redeemed'?`<div class="fact"><label>Data do resgate</label><strong>${redeemed}</strong></div>`:''}</div></section>${msg?`<div class="message">“${msg}”</div>`:''}<div class="ticket"><div class="eyebrow">Código exclusivo para resgate</div><strong>${code}</strong><p>Apresente este código à loja parceira para receber seu presente. O voucher só pode ser utilizado uma vez, conforme as condições do pedido.</p><span class="status">${status}</span></div></main><footer class="foot">R&M Marketplace · Documento de presente vinculado ao pedido ${order}. Este voucher não exibe valores financeiros. A confirmação e a validação do resgate devem ser realizadas pela loja responsável.</footer></article><div class="actions"><button onclick="window.print()">Imprimir ou salvar em PDF</button></div><p class="hint">Guarde este documento e apresente o código no momento do resgate.</p></div>

</body></html>`;
};


;


/* Open the actual complete voucher in a visible preview, not an old cached download. */
let rm27VoucherURL=null;
function rm27VoucherOrder(id){return orders.find(x=>String(x.id)===String(id))}
function rm27MakeURL(o){if(rm27VoucherURL){URL.revokeObjectURL(rm27VoucherURL);rm27VoucherURL=null}rm27VoucherURL=URL.createObjectURL(new Blob([rm23VoucherHtml(o)],{type:'text/html;charset=utf-8'}));return rm27VoucherURL}
function rm27PreviewVoucher(id){
 const o=rm27VoucherOrder(id);if(!o?.recipient||!o.voucher)return toast('Voucher indisponível.');
 const url=rm27MakeURL(o);
 modal(`<div class="rm27-modal"><div class="rm27-head"><div><h2>Seu voucher completo</h2><p>Confira o presente e todos os dados do pedido. O valor não aparece.</p></div></div><iframe class="rm27-frame" title="Voucher completo R&M" src="${url}"></iframe><div class="rm27-actions"><button type="button" class="btn btn-outline" onclick="rm27SaveVoucher(${JSON.stringify(String(id))})"><i class="fa-solid fa-download"></i> Baixar voucher</button><button type="button" class="btn" onclick="rm27PrintVoucher()"><i class="fa-solid fa-print"></i> Imprimir / PDF</button></div></div>`,true);
 const m=document.querySelector('.modal');if(m)m.classList.add('wide');
}
function rm27SaveVoucher(id){const o=rm27VoucherOrder(id);if(!o)return;const url=URL.createObjectURL(new Blob([rm23VoucherHtml(o)],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='RM-Voucher-'+String(o.number||o.id).replace(/[^a-z0-9-]/gi,'')+'.html';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
function rm27PrintVoucher(){const frame=document.querySelector('.rm27-frame');if(!frame)return;try{frame.contentWindow.focus();frame.contentWindow.print()}catch(e){toast('Use Baixar voucher para imprimir o arquivo.')}}
downloadVoucher=function(id){rm27PreviewVoucher(id)};


;


/* Reliable voucher HTML export with visible fallbacks for restrictive browsers. */
function rm28VoucherMarkup(id){
 const o=rm27VoucherOrder(id);
 if(!o||!o.recipient||!o.voucher){toast('Este pedido ainda não possui voucher disponível.');return null}
 try{const html=rm23VoucherHtml(o);if(typeof html!=='string'||!html.includes('<html'))throw Error('HTML inválido');return {html,o}}catch(e){console.error('Erro ao montar voucher',e);toast('Não foi possível preparar o voucher.');return null}
}
function rm28FileName(o){return 'RM-Voucher-'+String(o.number||o.id||o.voucher).replace(/[^a-z0-9_-]/gi,'')+'.html'}
function rm28SaveViaAnchor(html,name,useData){
 const href=useData?'data:text/html;charset=utf-8,'+encodeURIComponent(html):URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
 const a=document.createElement('a');a.href=href;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();
 if(!useData)setTimeout(()=>URL.revokeObjectURL(href),120000);
}
function rm27SaveVoucher(id){
 const result=rm28VoucherMarkup(id);if(!result)return;
 try{rm28SaveViaAnchor(result.html,rm28FileName(result.o),false);toast('Download solicitado. Confira a pasta Downloads do navegador.')}catch(e){
  console.error('Falha no download do voucher',e);
  try{rm28SaveViaAnchor(result.html,rm28FileName(result.o),true)}catch(e2){toast('Seu navegador bloqueou o download. Use Abrir voucher e salve a página.')}
 }
}
function rm28OpenVoucher(id){
 const result=rm28VoucherMarkup(id);if(!result)return;
 const w=window.open('','_blank');
 if(!w){toast('Permita pop-ups para abrir o voucher ou use Imprimir / PDF.');return}
 w.document.open();w.document.write(result.html);w.document.close();
}
/* The original preview is preserved; add a usable fallback if browser blocks downloads. */
const rm28OriginalPreview=rm27PreviewVoucher;
rm27PreviewVoucher=function(id){
 rm28OriginalPreview(id);
 const bar=document.querySelector('.rm27-actions');
 if(bar&&!bar.querySelector('.rm28-open')){
  const b=document.createElement('button');b.type='button';b.className='btn btn-outline rm28-open';
  b.innerHTML='<i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir voucher em outra aba';
  b.addEventListener('click',()=>rm28OpenVoucher(id));bar.appendChild(b);
 }
};


;


/* V29: voucher disponível somente por download HTML, sem prévia ou impressão. */
const rm29OriginalVoucherHTML = rm23VoucherHtml;
rm23VoucherHtml = function(order){
 let html = rm29OriginalVoucherHTML(order);
 // Retira o botão de impressão que estava dentro do próprio arquivo baixado.
 html = html.replace(/<div class="actions"><button onclick="window\.print\(\)">Imprimir ou salvar em PDF<\/button><\/div>/g,'');
 html = html.replace(/<button onclick="window\.print\(\)">Imprimir voucher<\/button>/g,'');
 return html;
};
downloadVoucher = function(id){
 const result=rm28VoucherMarkup(id);
 if(!result)return;
 try{
  rm28SaveViaAnchor(result.html,rm28FileName(result.o),false);
  toast('Download do voucher solicitado. Confira seus downloads.');
 }catch(error){
  console.error('Falha ao baixar voucher:',error);
  try{rm28SaveViaAnchor(result.html,rm28FileName(result.o),true)}
  catch(secondError){toast('O navegador impediu o download. Verifique as permissões de download.');}
 }
};
// Mantém compatibilidade com eventuais botões antigos de baixar.
rm27SaveVoucher = downloadVoucher;


;


/* V30: validade destacada e compartilhamento real do arquivo HTML. */
const rm30OrdersBefore=ordersPage;
ordersPage=function(){
 let html=rm30OrdersBefore();
 html=html.replace(/onclick="copyGift\('([^']+)'\)"\s*>Copiar mensagem/g, 'onclick="rm30ShareGift(\'$1\')"><i class="fa-solid fa-share-nodes"></i> Compartilhar presente');
 return html;
};
const rm30VoucherBefore=rm23VoucherHtml;
rm23VoucherHtml=function(o){
 let html=rm30VoucherBefore(o);
 const expiry=rmV9Expiry(o);
 const date=expiry.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
 const expired=Date.now()>expiry.getTime();
 const warning='<section class="rm30-validity" role="note" style="margin-top:22px;padding:18px 20px;border:1px solid '+(expired?'#e6b4b4':'#e4d5b9')+';background:'+(expired?'#fff1f0':'#fff9ed')+';border-radius:6px;color:#584b3e;font:600 13px/1.7 Arial,sans-serif"><strong style="display:block;font-size:15px;margin-bottom:4px">'+(expired?'Voucher com prazo vencido':'Atenção: este voucher tem validade')+'</strong>Válido até <strong>'+date+'</strong>. O voucher é de uso único e não poderá ser resgatado após o vencimento ou depois de utilizado. Consulte as condições da loja parceira.</section>';
 html=html.replace('</main><footer class="foot">',warning+'</main><footer class="foot">');
 // Remove também a impressão que persistia na versão 26 do documento.
 html=html.replace(/<div class="actions"><button onclick="window\.print\(\)">[\s\S]*?<\/button><\/div>/g,'');
 return html;
};
async function rm30ShareGift(id){
 const result=rm28VoucherMarkup(id);if(!result)return;
 const {o,html}=result;
 const name=rm28FileName(o);
 const expiry=rmV9Expiry(o).toLocaleDateString('pt-BR');
 const message=giftMessage(o)+'\n\nIMPORTANTE: Voucher válido até '+expiry+'. Uso único.\n\nO voucher HTML está anexado a esta mensagem, quando o aplicativo permitir o envio de arquivos.';
 const file=new File([html],name,{type:'text/html'});
 try{
  if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
   await navigator.share({title:'Você recebeu um presente R&M!',text:message,files:[file]});
   return;
  }
 }catch(err){if(err?.name==='AbortError')return;console.warn('Compartilhamento de arquivo não disponível',err)}
 // Sem hospedagem pública, o HTML não tem URL compartilhável. Não gerar links locais falsos.
 try{rm28SaveViaAnchor(html,name,false)}catch(err){console.warn('Download não disponível',err)}
 const whatsapp='https://wa.me/?text='+encodeURIComponent(giftMessage(o)+'\n\nVoucher válido até '+expiry+'. Uso único.\n\nEnvie também o arquivo '+name+' que foi baixado para o seu dispositivo.');
 modal('<h2>Compartilhar presente</h2><p>Seu voucher HTML foi preparado para download. Para enviar a alguém, anexe esse arquivo à conversa junto com a mensagem de presenteio.</p><div class="demo"><strong>Importante:</strong> um HTML salvo no dispositivo não tem link público. Para compartilhar por link, será necessário publicar o voucher em um endereço online.</div><button class="btn" onclick="window.open(\''+whatsapp+'\',\'_blank\')"><i class="fa-brands fa-whatsapp"></i> Compartilhar mensagem no WhatsApp</button><button class="btn btn-outline" onclick="downloadVoucher(\''+String(id).replace(/'/g,'')+'\')"><i class="fa-solid fa-download"></i> Baixar HTML novamente</button>');
}


;


/* Mensagem de presenteio escrita diretamente para quem vai receber. */
function rm31RecipientMessage(o){
 const receiver=String(o.recipient?.name||'você').trim();
 const sender=String(o.buyerName||o.buyer?.name||currentUser()?.name||'Alguém que gosta muito de você').trim();
 const item=prod(o.productId)?.name||'um presente especial';
 const store=o.store||'a loja parceira';
 const personal=String(o.recipient?.message||'').trim();
 const until=rmV9Expiry(o).toLocaleDateString('pt-BR');
 return `🎁✨ ${receiver}, TEM UM PRESENTE ESPECIAL PARA VOCÊ! ✨🎁\n\n`+
 `Hoje alguém quis transformar seu dia em uma lembrança bonita. 💝\n\n`+
 `${sender} preparou uma surpresa com carinho: *${item}*!\n\n`+
 (personal?`💌 Uma mensagem especialmente para você:\n“${personal}”\n\n`:'')+
 `🏬 Onde aproveitar: ${store}\n`+
 `🎟️ Seu código de presente: ${o.voucher||'consulte o voucher anexo'}\n`+
 `📅 Válido até: ${until} (uso único).\n\n`+
 `Abra o voucher HTML enviado junto com esta mensagem e apresente-o na loja para resgatar seu presente.\n\n`+
 `Com carinho, ${sender}. ❤️\n\n`+
 `R&M — Presentear é viver.`;
}
async function rm30ShareGift(id){
 const result=rm28VoucherMarkup(id);if(!result)return;
 const {o,html}=result;
 const name=rm28FileName(o);
 const message=rm31RecipientMessage(o);
 const file=new File([html],name,{type:'text/html'});
 try{
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
   await navigator.share({title:'🎁 Um presente especial para você!',text:message,files:[file]});
   return;
  }
 }catch(err){if(err?.name==='AbortError')return;console.warn('Compartilhamento de arquivo indisponível',err)}
 try{rm28SaveViaAnchor(html,name,false)}catch(err){console.warn('Download indisponível',err)}
 const whatsapp='https://wa.me/?text='+encodeURIComponent(message+'\n\n📎 O voucher HTML deve ser enviado como arquivo nesta conversa.');
 modal('<h2>Envie essa surpresa para quem vai receber 💝</h2><p>Esta mensagem foi preparada especialmente para o presenteado. Envie pelo WhatsApp e anexe o voucher HTML que acabou de baixar.</p><div class="demo" style="white-space:pre-wrap;max-height:220px;overflow:auto">'+safe(message)+'</div><button class="btn" id="rm31-whatsapp"><i class="fa-brands fa-whatsapp"></i> Enviar mensagem especial no WhatsApp</button><button class="btn btn-outline" id="rm31-download"><i class="fa-solid fa-download"></i> Baixar voucher HTML</button>');
 document.getElementById('rm31-whatsapp')?.addEventListener('click',()=>window.open(whatsapp,'_blank','noopener'));
 document.getElementById('rm31-download')?.addEventListener('click',()=>downloadVoucher(id));
}


;


/* Visual feedback only. Registration remains a local-browser demonstration. */
const rm33PreviousAuthSubmit=authSubmit;
let rm33Busy=false;
function rm33CloseLoading(){document.getElementById('rm33-loading')?.remove();rm33Busy=false}
function rm33WelcomeUser(user){
 const first=String(user?.name||'').trim().split(/\s+/)[0]||'você';
 const pending=!!pendingAction;
 modal(`<div class="rm33-welcome"><div class="rm33-welcome-icon"><i class="fa-solid fa-check"></i></div><span class="editorial-kicker">CONTA CRIADA</span><h2>Boas-vindas à R&M, ${safe(first)}!</h2><p>Sua conta foi criada com sucesso neste navegador. Agora você pode descobrir presentes, salvar suas escolhas e acompanhar seus pedidos.</p><button type="button" class="btn" onclick="closeModal();navigate('home')">Começar a explorar <i class="fa-solid fa-arrow-right"></i></button><small>Presentear é criar momentos que ficam.</small></div>`);
}
authSubmit=function(e,register){
 if(!register)return rm33PreviousAuthSubmit(e,register);
 e.preventDefault();
 if(rm33Busy)return;
 const form=e.target;
 if(!form.checkValidity()){form.reportValidity();return}
 const data=new FormData(form);
 const email=String(data.get('email')||'').trim().toLowerCase();
 const cpf=String(data.get('cpf')||'').replace(/\D/g,'');
 const ddd=String(data.get('ddd')||'').replace(/\D/g,'');
 const mobile=String(data.get('mobile')||'').replace(/\D/g,'');
 if(users.some(u=>String(u.email||'').toLowerCase()===email)){toast('Este e-mail já está cadastrado.');return}
 if(!/^\d{11}$/.test(cpf)){toast('Informe um CPF com 11 dígitos.');return}
 if(form.querySelector('[name="ddd"]')&&(!/^[1-9][1-9]$/.test(ddd)||!/^9\d{8}$/.test(mobile))){toast('Confira o WhatsApp informado.');return}
 rm33Busy=true;
 const button=form.querySelector('button[type="submit"],button.btn');if(button)button.disabled=true;
 document.body.insertAdjacentHTML('beforeend',`<div id="rm33-loading" class="rm33-loading" role="status" aria-live="polite"><div class="rm33-loading-card"><div class="rm33-mark">R&M</div><h2>Criando sua conta</h2><p>Estamos preparando seu espaço na R&M. Só um instante...</p><div class="rm33-progress"><span></span></div></div></div>`);
 const before=users.length;
 setTimeout(()=>{
  try{
   rm33PreviousAuthSubmit({preventDefault(){},target:form},true);
   const created=users.length>before&&!!currentUser();
   rm33CloseLoading();
   if(created){rm33WelcomeUser(currentUser())}
   else if(button)button.disabled=false;
  }catch(err){rm33CloseLoading();if(button)button.disabled=false;console.error('Erro ao criar conta:',err);toast('Não foi possível concluir o cadastro. Tente novamente.')}
 },1450);
};


;


/* Ações síncronas locais recebem resposta visual curta; não altera dados, validações ou fluxo. */
(function(){
 const actions=[
  {re:/\b(excluir|apagar|remover|deletar)\b/i,label:'Excluindo...'},
  {re:/\b(enviar|encaminhar|publicar|compartilhar)\b/i,label:'Enviando...'},
  {re:/\b(salvar|atualizar|editar|alterar)\b/i,label:'Salvando alterações...'},
  {re:/\b(aprovar|confirmar|concluir|finalizar|resgatar)\b/i,label:'Processando...'},
  {re:/\b(cadastrar|criar|adicionar)\b/i,label:'Preparando...'},
  {re:/\b(carregar|baixar|gerar)\b/i,label:'Preparando arquivo...'}
 ];
 let timer=0,active=null;
 function reset(){
  clearTimeout(timer);
  document.getElementById('rm35-status')?.remove();
  if(active?.isConnected){active.classList.remove('rm35-busy');active.removeAttribute('aria-busy');
   const spin=active.querySelector('.rm35-spinner[data-rm35]');spin?.remove();}
  active=null;
 }
 function show(btn,label){
  reset();active=btn;
  btn.classList.add('rm35-busy');btn.setAttribute('aria-busy','true');
  const sp=document.createElement('span');sp.className='rm35-spinner';sp.dataset.rm35='1';sp.setAttribute('aria-hidden','true');btn.prepend(sp);
  const el=document.createElement('div');el.id='rm35-status';el.className='rm35-status';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  el.innerHTML='<span class="rm35-spinner" aria-hidden="true"></span><span></span>';
  el.lastElementChild.textContent=label;document.body.appendChild(el);
  timer=setTimeout(reset,780);
 }
 document.addEventListener('click',function(e){
  const btn=e.target.closest('button,input[type="submit"]');if(!btn||btn.disabled||btn.classList.contains('rm35-busy'))return;
  if(btn.closest('#rm35-status,#rm33-loading'))return;
  const label=String(btn.innerText||btn.value||btn.getAttribute('aria-label')||'').trim();
  const action=actions.find(x=>x.re.test(label));if(!action)return;
  // Confirmações nativas e navegação externa continuam imediatas.
  if(btn.closest('a[href]')||btn.hasAttribute('formaction'))return;
  // Se uma confirmação abrir, a caixa de diálogo permanece prioritária.
  setTimeout(()=>{
   if(!document.contains(btn)){
    const el=document.createElement('div');el.id='rm35-status';el.className='rm35-status';el.setAttribute('role','status');
    el.innerHTML='<span class="rm35-spinner" aria-hidden="true"></span><span></span>';el.lastElementChild.textContent=action.label;
    document.getElementById('rm35-status')?.remove();document.body.appendChild(el);clearTimeout(timer);timer=setTimeout(reset,650);
   }else show(btn,action.label);
  },0);
 },true);
 document.addEventListener('submit',function(e){
  const btn=e.submitter||e.target.querySelector('button[type="submit"]');
  if(!btn||btn.classList.contains('rm35-busy'))return;
  const label=String(btn.innerText||btn.value||'').trim();const action=actions.find(x=>x.re.test(label));
  if(action)setTimeout(()=>{if(document.contains(btn))show(btn,action.label)},0);
 },true);
 window.addEventListener('pagehide',reset);
})();


;


/* Mensagens exclusivas por tema: voucher HTML e compartilhamento. */
const rm38ThemeMessages={"mae": "Mãe, seu amor está presente em cada lembrança bonita da minha vida. Este presente é uma pequena forma de agradecer por tanto carinho.", "pai": "Você me ensinou que amor também é presença, cuidado e coragem. Hoje quero retribuir um pouco de tudo o que recebi de você.", "familia": "Os melhores momentos da vida são aqueles que compartilhamos. Que este presente celebre os laços que nos mantêm sempre perto.", "romance": "Entre tantos encontros que a vida poderia oferecer, o meu favorito foi encontrar você. Que a nossa história continue sendo especial.", "paixao": "Assim como as flores, o amor cresce com cuidado e pequenos gestos. Este é mais um jeito de dizer o quanto você é importante.", "aniversario-amor": "Cada capítulo da nossa história tem um motivo para sorrir. Que venham muitos outros momentos para guardar no coração.", "amigos": "A vida fica mais leve e divertida quando temos amigos de verdade. Este presente é para celebrar a sorte de ter você por perto.", "parceria": "Algumas pessoas transformam momentos comuns em histórias inesquecíveis. Com você, sempre existe uma boa razão para celebrar.", "gratidao": "Seu empenho, dedicação e presença fazem a diferença. Receba este presente como reconhecimento e agradecimento por sua contribuição.", "conquista": "Grandes conquistas merecem ser reconhecidas. Que este presente marque o orgulho pelo caminho percorrido e inspire novas realizações.", "celebrar": "Hoje é dia de celebrar você, suas histórias e tudo o que torna sua presença tão especial. Aproveite cada instante desta surpresa.", "surpresa": "Nem toda surpresa precisa de uma ocasião. Às vezes, basta a vontade de fazer alguém especial sorrir. Hoje, esse alguém é você.", "renovar": "Todo novo começo traz possibilidades bonitas. Que este presente acompanhe seus próximos passos com esperança e alegria."};
function rm38ThemeMessage(o){
 const id=String(o?.giftTheme||'surpresa');
 return rm38ThemeMessages[id]||rm38ThemeMessages.surpresa;
}
const rm38PreviousVoucherHtml=rm23VoucherHtml;
rm23VoucherHtml=function(o){
 let html=rm38PreviousVoucherHtml(o);
 const phrase=rm38ThemeMessage(o);
 const block='<section class="rm38-dedication"><div class="rm38-dedication-label">Uma mensagem para este momento</div><p>'+safe(phrase)+'</p></section>';
 const css='<style>.rm38-dedication{margin:26px 0 6px;padding:25px 24px;background:#faf7f4;border-left:3px solid #a43748;text-align:center}.rm38-dedication-label{font:700 10px Arial,sans-serif;letter-spacing:1.7px;text-transform:uppercase;color:#98515c}.rm38-dedication p{font:italic 19px/1.65 Georgia,serif;color:#51434a;margin:14px 0 0}@media(max-width:540px){.rm38-dedication{padding:20px 15px}.rm38-dedication p{font-size:17px}}</style>';
 html=html.replace('</head>',css+'</head>');
 // Inserir antes dos detalhes do pedido, sem interferir na dedicatória escrita pelo comprador.
 const marker='<section class="section"><h3>Detalhes do pedido</h3>';
 if(html.includes(marker))html=html.replace(marker,block+marker);
 else html=html.replace('<div class="ticket">',block+'<div class="ticket">');
 return html;
};
if(typeof rm31RecipientMessage==='function'){
 const rm38PreviousRecipientMessage=rm31RecipientMessage;
 rm31RecipientMessage=function(o){
  const text=rm38PreviousRecipientMessage(o);
  const dedication='💌 Uma mensagem especial para este momento:\n“'+rm38ThemeMessage(o)+'”\n\n';
  const pos=text.indexOf('🏬 Onde aproveitar:');
  return pos>=0?text.slice(0,pos)+dedication+text.slice(pos):text+'\n\n'+dedication;
 };
}


;


/* Apresentação clara do pagamento, sem alegar validação bancária automática. */
(function(){
 const prior=checkoutRender;
 function esc42(v){return typeof safe==='function'?safe(String(v??'')):String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}
 function stage42(n){return '<div class="rm42-progress" aria-label="Etapa '+(n+1)+' de 3">'+[0,1,2].map(i=>'<span class="'+(i<=n?'on':'')+'"></span>').join('')+'</div>'}
 function detail42(label,value){return '<div class="rm42-row"><span>'+label+'</span><strong>'+esc42(value)+'</strong></div>'}
 checkoutRender=function(){
  prior();
  const el=document.querySelector('#modal-root .modal');if(!el)return;
  const p=typeof prod==='function'?prod(selected):null;if(!p)return;
  const pay=typeof getPayment==='function'?getPayment(p.store):{};
  const method=checkoutMethod==='pix'?'Pix':'Presencial';
  const step=Math.min(2,Math.max(0,Number(checkoutStep)||0));
  const top='<div class="rm42-head"><i class="fa-solid fa-lock"></i><div><strong>Resumo do seu pagamento</strong><small>Confira os dados e acompanhe a confirmação diretamente com a loja parceira.</small></div></div>'+stage42(step);
  const h=el.querySelector('h2');if(h)h.insertAdjacentHTML('beforebegin',top);
  const note='<div class="rm42-foot"><i class="fa-solid fa-circle-info"></i> A aprovação depende da confirmação da empresa parceira.</div>';
  if(step===0){
   const old=el.querySelectorAll('.pay-choice');
   old.forEach(choice=>{
    choice.classList.add('rm42-choice');
    const title=choice.querySelector('strong');
    const sub=choice.querySelector('small');
    if(title&&/pix/i.test(title.textContent)){if(sub)sub.textContent='Transferência direta para a chave cadastrada pela loja';}
    else if(sub)sub.textContent='Combine o pagamento na loja, conforme as opções disponíveis';
   });
   const btn=[...el.querySelectorAll('button')].find(b=>/Continuar/i.test(b.textContent));
   if(btn)btn.insertAdjacentHTML('beforebegin','<div class="rm42-payment-detail"><div class="rm42-kicker">Resumo da compra</div>'+detail42('Presente',p.name)+detail42('Empresa responsável',p.store)+detail42('Forma selecionada',method)+'<div class="rm42-row"><span>Total do pedido</span><strong>'+money(p.price)+'</strong></div></div>');
   el.insertAdjacentHTML('beforeend',note);
  }else if(step===1&&checkoutMethod==='pix'){
   const key=String(pay.pix||'').trim();
   const receiver=pay.receiver||p.store;
   const bank=pay.bank||'Consulte a empresa';
   const box='<div class="rm42-payment-detail"><div class="rm42-kicker">Valor exato da transferência</div><div class="rm42-amount">'+money(p.price)+'</div>'+detail42('Beneficiário informado',receiver)+detail42('Instituição informada',bank)+detail42('Empresa parceira',p.store)+'</div>'+
   (key?'<div class="rm42-kicker" style="margin:14px 0 8px">Chave Pix da empresa</div><div class="rm42-copy"><code>'+esc42(key)+'</code><button type="button" onclick="copyText(getPayment(prod(selected).store).pix)"><i class="fa-regular fa-copy"></i> Copiar chave</button></div>':'<div class="rm42-note"><i class="fa-solid fa-circle-exclamation"></i><div>A empresa ainda não cadastrou uma chave Pix. Solicite os dados diretamente à loja antes de pagar.</div></div>')+
   '<ol class="rm42-instructions"><li>Abra o aplicativo do seu banco e escolha Pix.</li><li>Informe a chave e o valor exibidos acima.</li><li><strong>Confira o nome do recebedor no aplicativo do banco</strong> antes de autorizar.</li><li>Guarde o comprovante e informe a empresa para conferência.</li></ol>'+
   '<div class="rm42-note"><i class="fa-solid fa-shield-halved"></i><div><strong>Sua confirmação não substitui a conferência bancária.</strong> O pagamento é feito no aplicativo do seu banco, diretamente à empresa. A R&M não solicita senha bancária, código de autenticação ou acesso à sua conta.</div></div>';
   const timer=el.querySelector('.rm-pay-wait');
   if(timer){timer.insertAdjacentHTML('beforebegin',box);const ps=timer.querySelectorAll('p');if(ps[0])ps[0].textContent='Tempo para conferir os dados da transferência';if(ps[1])ps[1].textContent='Após este intervalo, você poderá informar que realizou o Pix. Isso não confirma o recebimento.';}
   else {const btn=[...el.querySelectorAll('button')].find(b=>/Já realizei/i.test(b.textContent));if(btn)btn.insertAdjacentHTML('beforebegin',box);}
   el.insertAdjacentHTML('beforeend',note);
  }else if(checkoutMethod==='cash'){
   const box='<div class="rm42-payment-detail"><div class="rm42-kicker">Pagamento na empresa</div>'+detail42('Empresa parceira',p.store)+detail42('Presente',p.name)+detail42('Valor combinado',money(p.price))+detail42('Forma de pagamento',window.payDetail||'A definir com a loja')+'</div><div class="rm42-note"><i class="fa-solid fa-store"></i><div><strong>Nenhuma cobrança é realizada nesta página.</strong> Combine a disponibilidade, o valor e a forma de pagamento com a empresa. O pedido só será aprovado após a conferência pela loja.</div></div>';
   const btn=[...el.querySelectorAll('button')].find(b=>/Solicitar pedido|Salvar meu pedido|Confirmar pedido/i.test(b.textContent));
   if(btn)btn.insertAdjacentHTML('beforebegin',box);
   else el.insertAdjacentHTML('beforeend',box);
   el.insertAdjacentHTML('beforeend',note);
  }else{
   const btn=[...el.querySelectorAll('button')].find(b=>/Solicitar pedido|Salvar meu pedido|Confirmar pedido/i.test(b.textContent));
   const box='<div class="rm42-payment-detail"><div class="rm42-kicker">Conferência do pedido</div>'+detail42('Presente',p.name)+detail42('Empresa',p.store)+detail42('Valor',money(p.price))+detail42('Pagamento',method)+'</div><div class="rm42-note"><i class="fa-solid fa-clock"></i><div>O pedido será registrado como <strong>aguardando aprovação</strong>. A empresa verificará o pagamento e a disponibilidade antes de liberar o presente.</div></div>';
   if(btn)btn.insertAdjacentHTML('beforebegin',box);else el.insertAdjacentHTML('beforeend',box);
   el.insertAdjacentHTML('beforeend',note);
  }
 };
})();


;


(function(){
 let submitting=false;
 const originalSubmit=submitOrder;
 submitOrder=function(){
  if(submitting)return;
  const p=prod(selected),u=currentUser();
  if(!p||!u){toast('Confira os dados do pedido.');return;}
  submitting=true;
  try{return originalSubmit.apply(this,arguments)}finally{setTimeout(()=>{submitting=false},1500)}
 };
 function receiptHtml(o){
  const p=prod(o.productId),buyer=users.find(u=>u.id===o.userId);
  const esc=x=>safe(String(x??''));
  const dt=new Date(o.created);const date=Number.isNaN(dt.getTime())?'Não informada':dt.toLocaleString('pt-BR');
  const rows=[['Pedido',o.number],['Data e hora',date],['Empresa parceira',o.store],['Presente',p?.name||'Presente cadastrado'],['Comprador',buyer?.name||'Não informado'],['Forma de pagamento',o.payment],['Valor do pedido',money(o.price)],['Situação do pedido',statusText(o.status)]];
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Resumo do pedido '+esc(o.number)+'</title><style>body{font:14px Arial,sans-serif;color:#292a30;background:#f7f5f1;margin:0;padding:24px}.sheet{max-width:640px;margin:25px auto;padding:35px;background:#fff;border:1px solid #e5dfd8}header{border-bottom:2px solid #a43748;padding-bottom:20px;margin-bottom:22px}h1{color:#a43748;font-size:29px;margin:0}h2{font-size:21px;margin:18px 0}p{line-height:1.7;color:#666}table{border-collapse:collapse;width:100%}td{padding:13px 0;border-bottom:1px solid #eee;vertical-align:top}td:first-child{color:#777;width:43%}td:last-child{font-weight:bold;text-align:right;overflow-wrap:anywhere}.note{margin-top:25px;padding:16px;background:#f8f6f2;font-size:12px;line-height:1.8;color:#555}small{color:#777}@media(max-width:480px){body{padding:8px}.sheet{padding:18px}}</style></head><body><div class="sheet"><header><h1>R&M</h1><small>Presentear é viver</small></header><h2>Resumo do pedido</h2><p>Guarde este documento para acompanhar sua compra.</p><table>'+rows.map(([k,v])=>'<tr><td>'+esc(k)+'</td><td>'+esc(v)+'</td></tr>').join('')+'</table><div class="note"><b>Sobre a confirmação</b><br>Este documento registra o pedido, mas não comprova pagamento nem substitui documento fiscal. A empresa parceira confere o pagamento e aprova a liberação do presente. O voucher é disponibilizado conforme a situação do pedido.</div></div></body></html>';
 }
 window.rm44Receipt=function(id){
  const o=orders.find(x=>x.id===id&&x.userId===session?.id);
  if(!o){toast('Pedido não encontrado na sua conta.');return;}
  const blob=new Blob([receiptHtml(o)],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='RM-pedido-'+String(o.number).replace(/[^a-zA-Z0-9-]/g,'')+'.html';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  toast('Resumo do pedido preparado!');
 };
 const originalOrders=ordersPage;
 ordersPage=function(){
  const html=originalOrders();if(!session)return html;
  const mine=myOrders();let idx=0;
  return html.replace(/(<div class="order-actions">)([\s\S]*?)(<\/div>)/g,function(all,opening,inner,closing){
   const o=mine[idx++];if(!o)return all;
   return opening+inner+'<button type="button" class="rm44-receipt" onclick="rm44Receipt(\''+String(o.id).replace(/'/g,'')+'\')"><i class="fa-regular fa-file-lines"></i> Baixar resumo</button>'+closing;
  });
 };
})();


;


(function(){
 let saving=false;
 const beforeSave=submitOrder;
 submitOrder=function(){
  if(saving)return;
  const p=prod(selected),u=currentUser();
  if(!p||!u)return beforeSave.apply(this,arguments);
  saving=true;
  const args=arguments,context=this;
  document.getElementById('rm45-save-overlay')?.remove();
  const overlay=document.createElement('div');
  overlay.id='rm45-save-overlay';overlay.className='rm45-save-loading';
  overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');
  overlay.innerHTML='<div class="rm45-save-panel"><div class="rm45-save-symbol">R&M</div><h2>Preparando seu pedido</h2><p>Estamos organizando os detalhes do seu presente. Aguarde um instante.</p><div class="rm45-save-track"><div></div></div><small>Seu pedido será registrado em instantes</small></div>';
  document.body.appendChild(overlay);
  setTimeout(function(){
   try{overlay.remove();beforeSave.apply(context,args)}
   catch(err){console.error('Erro ao salvar pedido:',err);toast('Não foi possível salvar seu pedido. Tente novamente.')}
   finally{saving=false}
  },5000);
 };
})();

