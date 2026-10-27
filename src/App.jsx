import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './styles/App.css';

const personaRules = [
  {
    id: 'founder',
    title: 'Фаундер / CEO',
    caption: 'Нужна стратегия и ускорение запуска',
    regex: /(фаундер|основател|ceo|стартап|launch|go to market|gtm)/i,
    tone: 'Мы соберём команду под ваш темп и закроем процессы за недели.',
  },
  {
    id: 'product',
    title: 'Product / PM',
    caption: 'Ищет команду под конкретные фичи',
    regex: /(product|pm|продакт|roadmap|фича|фичу|релиз)/i,
    tone: 'Погружаемся в бэклог, снимаем риски и отдаём измеримый результат.',
  },
  {
    id: 'ops',
    title: 'Операционный лидер',
    caption: 'Нужны внутренние инструменты и регламенты',
    regex: /(операцион|ops|backoffice|бэк-офис|автоматизац|sap|crm|внутренн)/i,
    tone: 'Делаем так, чтобы операционка работала без ручных костылей.',
  },
  {
    id: 'marketing',
    title: 'Маркетинг / Growth',
    caption: 'Усилить воронку или клиентский сервис',
    regex: /(маркет|growth|crm маркетинг|support|поддержк|лиды|привлечен)/i,
    tone: 'Упакуем сценарии, автоматизируем коммуникации и меряем LTV.',
  },
];

const needRules = [
  { id: 'internal', title: 'Внутренние инструменты', regex: /(внутрен|backoffice|crm|erp|операционк|процесс)/i },
  { id: 'automation', title: 'Что-то необычное', regex: /(автомат|бот|нейрон|chatbot|custom|уникал|сложн)/i },
  { id: 'clients', title: 'Для клиентов', regex: /(клиент|support|поддержк|продаж|лид)/i },
  { id: 'analytics', title: 'Аналитика и отчёты', regex: /(отчёт|дата|аналит|dash|bi|датамарт)/i },
];

const prompts = [
  'Я фаундер fintech, нужен голосовой бот для саппорта.',
  'Мы продакт-команда: хотим автоматизировать онбординг сотрудников.',
  'Ищем инструмент для внутренней аналитики финансов.',
  'Нужен кастомный ассистент для поддержки клиентов 24/7.',
];

const rings = ['/1 (10).png', '/1 (14).png'];

const backgroundDeck = [
  { src: '/objects/1 (1).png', top: '8%', left: '6%', size: '32vw' },
  { src: '/objects/1 (12).png', top: '55%', left: '70%', size: '28vw' },
  { src: '/objects/1 (24).png', top: '20%', left: '65%', size: '24vw' },
  { src: '/objects/1 (35).png', top: '68%', left: '12%', size: '26vw' },
  { src: '/objects/1 (5).png', top: '60%', left: '85%', size: '22vw' },
  { src: '/objects/1 (7).png', top: '15%', left: '80%', size: '18vw' },
  { src: '/objects/1 (18).png', top: '82%', left: '55%', size: '22vw' },
  { src: '/objects/1 (30).png', top: '40%', left: '40%', size: '30vw' },
  { src: '/objects/1 (41).png', top: '10%', left: '42%', size: '24vw' },
];

const createMessage = (role, text) => ({
  id: `${role}-${Date.now()}-${Math.random()}`,
  role,
  text,
});

function detectMatch(text, rules) {
  if (!text) return null;
  return rules.find((rule) => rule.regex.test(text)) || null;
}

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    createMessage('bot', 'Привет! Я e/tech_al и собираю кастомные сервисы и агентов.'),
    createMessage('bot', 'Расскажи, кем ты являешься и какой контур хочешь усилить?'),
  ]);
  const [phase, setPhase] = useState('intro');
  const [personaMatch, setPersonaMatch] = useState(null);
  const [needMatch, setNeedMatch] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const persona = useMemo(() => personaMatch, [personaMatch]);
  const need = useMemo(() => needMatch, [needMatch]);

  const chips = useMemo(() => needRules.map((rule) => ({ id: rule.id, title: rule.title })), []);

  const craftResponse = (text) => {
    if (phase === 'intro') {
      const match = detectMatch(text, personaRules);
      if (match) setPersonaMatch(match);
      setPhase('need');
      return match
        ? `Супер, ${match.title.toLowerCase()} зафиксировал. Что именно должно появиться или улучшиться?`
        : 'Понял, а теперь расскажи что нужно построить или автоматизировать?';
    }

    if (phase === 'need') {
      const match = detectMatch(text, needRules);
      if (match) setNeedMatch(match);
      setPhase('scope');
      const base = match ? `Вижу, что нужен блок «${match.title.toLowerCase()}».` : 'Звучит как интересная задача.';
      return `${base} Какой горизонт запуска и ключевые KPI успеха?`;
    }

    if (phase === 'scope') {
      setPhase('cta');
      return 'Горизонт поймал. Предлагаю подключиться лично: напиши мне в телеграм @dputat, соберём план и подключим команду.';
    }

    return 'Я на связи — пиши в @dputat или продолжай диалог здесь, чтобы двинуться дальше.';
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    const userMessage = createMessage('user', userText);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setIsTyping(true);
    const botReply = craftResponse(userText);

    setTimeout(() => {
      setMessages((prev) => [...prev, createMessage('bot', botReply)]);
      setIsTyping(false);
    }, 650);
  };

  const handlePromptClick = (text) => {
    setInput(text);
  };

  const handleChipClick = (chip) => {
    setInput((prev) => (prev ? `${prev} ${chip.title}` : chip.title));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page">
      <div className="background-deck" aria-hidden="true">
        {backgroundDeck.map((item) => (
          <img
            key={item.src}
            src={item.src}
            alt=""
            style={{ top: item.top, left: item.left, width: item.size }}
          />
        ))}
        <div className="background-fog" />
      </div>

      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
            <feComponentTransfer in="turbulence" result="mapped">
              <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
              <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
              <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
            </feComponentTransfer>
            <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
            <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lightingColor="white" result="specLight">
              <fePointLight x="-200" y="-200" z="300" />
            </feSpecularLighting>
            <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
            <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <header className="panel top-panel glass">
        <div className="brand">
          <span className="pulse" />
          e/tech_al
        </div>
        <nav className="menu">
          <button>кейсы</button>
          <button>процессы</button>
          <button>стек</button>
          <button>формат</button>
        </nav>
        <div className="badge">в линии 24/7</div>
      </header>

      <main className="layout">
        <section className="hero panel glass">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="eyebrow frost">Привет, мы делаем ботов и сервисы*</p>
            <h1>
              Считываем задачу, собираем цифровых агентов и сервисы под ваш бизнес.
              <span> Если пользы нет — честно отказываемся.</span>
            </h1>
            <p className="lead">
              Снизу живой чат. Сначала понимаем роль, затем задачу и только после этого предложим перейти в
              телеграм. Всё без нейросетей — чистые правила и опыт.
            </p>
            <div className="hero-tags">
              <span>bots</span>
              <span>service design</span>
              <span>operations</span>
              <span>growth</span>
            </div>
          </motion.div>

          <div className="hero-images">
            {rings.map((src, index) => (
              <motion.div
                key={src}
                className="ring-wrapper"
                initial={{ opacity: 0, rotateX: 45, rotateZ: -20, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  rotateX: 0,
                  rotateZ: 0,
                  scale: 1,
                  transition: { delay: 0.2 + index * 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                }}
                style={{
                  position: 'absolute',
                  zIndex: index + 1,
                  top: index === 0 ? '10%' : 'auto',
                  bottom: index === 1 ? '15%' : 'auto',
                  left: index === 0 ? '5%' : 'auto',
                  right: index === 1 ? '10%' : 'auto',
                }}
                whileHover={{ scale: 1.05, rotateZ: index ? -8 : 8 }}
              >
                <motion.img
                  src={src}
                  alt="chrome sculpture"
                  className="ring"
                  style={{
                    width: index === 0 ? '35vw' : '28vw',
                    maxWidth: index === 0 ? '500px' : '400px',
                  }}
                  animate={{ y: [0, -20, 0], rotate: [0, 2, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 6 + index * 2, ease: 'easeInOut' }}
                />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="dialog-section">
          <div className="liquidGlass-wrapper panel">
            <div className="liquidGlass-effect"></div>
            <div className="liquidGlass-tint"></div>
            <div className="liquidGlass-shine"></div>
            <div className="liquidGlass-content dialog">
              <div className="dialog-header">
                <div>
                  <p className="eyebrow">диалоговое окно</p>
                  <p className="muted">Сначала определяем роль и интерес, потом зовём в telegram</p>
                </div>
                <div className="phase">{phase === 'intro' ? 'узнаём роль' : phase === 'need' ? 'фиксируем задачу' : phase === 'scope' ? 'уточняем условия' : 'готовы к контакту'}</div>
              </div>

              <div className="dialog-body" ref={chatRef}>
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`bubble ${message.role}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {message.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <motion.div
                    className="bubble bot typing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span />
                    <span />
                    <span />
                  </motion.div>
                )}
              </div>

              <div className="input-shell liquid">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Например: я продакт в финтехе, хочу автоматизировать саппорт клиентов..."
                />
                <div className="actions-row">
                  <div className="chips">
                    {chips.map((chip) => (
                      <button key={chip.id} onClick={() => handleChipClick(chip)}>
                        {chip.title}
                      </button>
                    ))}
                  </div>
                  <button className="send" aria-label="отправить" onClick={handleSend} disabled={isTyping}>
                    → отправить
                  </button>
                </div>
              </div>

              <div className="prompt-grid">
                {prompts.map((prompt) => (
                  <button key={prompt} className="prompt-card" onClick={() => handlePromptClick(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="insights panel glass">
          <AnimatePresence>
            {persona ? (
              <motion.div
                key={persona.id}
                className="persona-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="eyebrow">Опознали роль</p>
                <h3>{persona.title}</h3>
                <p className="muted">{persona.caption}</p>
                <div className="tone">{persona.tone}</div>
              </motion.div>
            ) : (
              <motion.div className="persona-card placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="eyebrow">Опознание роли</p>
                <p className="muted">Когда поделишься, классифицируем и предложим сценарий.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="needs">
            <p className="eyebrow">Нужда</p>
            <div className="need-pills">
              {needRules.map((rule) => (
                <motion.div
                  key={rule.id}
                  className={`pill ${need?.id === rule.id ? 'active' : ''}`}
                  whileHover={{ scale: 1.05 }}
                >
                  <span>{rule.title}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="steps">
            <p className="eyebrow">Как работаем</p>
            <div className="step-grid">
              {[1, 2, 3].map((step) => (
                <motion.div key={step} className="step" whileHover={{ translateY: -6 }}>
                  <div className="step-index">0{step}</div>
                  <h4>{step === 1 ? 'Диагностика' : step === 2 ? 'Сборка решения' : 'Запуск и рост'}</h4>
                  <p>
                    {step === 1 && 'Уточняем процессы, зону влияния и критерии успеха.'}
                    {step === 2 && 'Собираем сервис, дизайн и инженерию единым потоком.'}
                    {step === 3 && 'Запуск, метрики, волнами усиливаем эффект и масштаб.'}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
