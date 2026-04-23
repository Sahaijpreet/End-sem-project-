import { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, X, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react';

const KEY = 'saar_flashcards';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (d) => localStorage.setItem(KEY, JSON.stringify(d));

const SUBJECTS = ['Computer Science','Physics','Chemistry','Mathematics','Economics','History','Biology','Other'];

export default function Flashcards() {
  const [decks, setDecks] = useState(load);
  const [activeDeck, setActiveDeck] = useState(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAddDeck, setShowAddDeck] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [deckForm, setDeckForm] = useState({ name: '', subject: '' });
  const [cardForm, setCardForm] = useState({ front: '', back: '' });
  const [shuffled, setShuffled] = useState(null);

  useEffect(() => { save(decks); }, [decks]);

  function addDeck(e) {
    e.preventDefault();
    const deck = { id: Date.now(), ...deckForm, cards: [] };
    setDecks((d) => [...d, deck]);
    setDeckForm({ name: '', subject: '' });
    setShowAddDeck(false);
  }

  function addCard(e) {
    e.preventDefault();
    setDecks((d) => d.map((deck) => deck.id === activeDeck.id
      ? { ...deck, cards: [...deck.cards, { id: Date.now(), ...cardForm }] }
      : deck
    ));
    setActiveDeck((d) => ({ ...d, cards: [...d.cards, { id: Date.now(), ...cardForm }] }));
    setCardForm({ front: '', back: '' });
    setShowAddCard(false);
  }

  function removeCard(cardId) {
    setDecks((d) => d.map((deck) => deck.id === activeDeck.id
      ? { ...deck, cards: deck.cards.filter((c) => c.id !== cardId) }
      : deck
    ));
    setActiveDeck((d) => ({ ...d, cards: d.cards.filter((c) => c.id !== cardId) }));
    setShuffled(null);
    setCardIdx(0);
  }

  function removeDeck(id) {
    setDecks((d) => d.filter((deck) => deck.id !== id));
    if (activeDeck?.id === id) setActiveDeck(null);
  }

  function openDeck(deck) {
    setActiveDeck(deck);
    setCardIdx(0);
    setFlipped(false);
    setShuffled(null);
  }

  const cards = shuffled || activeDeck?.cards || [];

  function next() { setCardIdx((i) => (i + 1) % cards.length); setFlipped(false); }
  function prev() { setCardIdx((i) => (i - 1 + cards.length) % cards.length); setFlipped(false); }

  function shuffle() {
    const arr = [...activeDeck.cards].sort(() => Math.random() - 0.5);
    setShuffled(arr);
    setCardIdx(0);
    setFlipped(false);
  }

  function reset() { setShuffled(null); setCardIdx(0); setFlipped(false); }

  if (activeDeck) {
    const card = cards[cardIdx];
    return (
      <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setActiveDeck(null)} className="flex items-center gap-2 text-sm text-ink-800 hover:text-accent-primary">
              <ChevronLeft className="h-4 w-4" /> Back to Decks
            </button>
            <div className="flex gap-2">
              <button onClick={shuffle} className="flex items-center gap-1 px-3 py-1.5 border border-parchment-300 rounded-lg text-xs text-ink-800 hover:bg-parchment-100 bg-white">
                <Shuffle className="h-3.5 w-3.5" /> Shuffle
              </button>
              <button onClick={reset} className="flex items-center gap-1 px-3 py-1.5 border border-parchment-300 rounded-lg text-xs text-ink-800 hover:bg-parchment-100 bg-white">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
              <button onClick={() => setShowAddCard(true)} className="flex items-center gap-1 px-3 py-1.5 bg-accent-primary text-white rounded-lg text-xs font-semibold hover:bg-accent-hover">
                <Plus className="h-3.5 w-3.5" /> Card
              </button>
            </div>
          </div>

          <div className="text-center mb-4">
            <h2 className="font-bold text-ink-900 text-lg">{activeDeck.name}</h2>
            <p className="text-sm text-ink-800">{cardIdx + 1} / {cards.length} cards</p>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-parchment-200">
              <Layers className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-ink-800 mb-4">No cards yet. Add your first flashcard!</p>
              <button onClick={() => setShowAddCard(true)} className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold">Add Card</button>
            </div>
          ) : (
            <>
              {/* Flip card */}
              <div className="relative h-64 cursor-pointer mb-6" onClick={() => setFlipped((f) => !f)}
                style={{ perspective: '1000px' }}>
                <div className="w-full h-full transition-transform duration-500 relative"
                  style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                  {/* Front */}
                  <div className="absolute inset-0 bg-white rounded-2xl border-2 border-parchment-200 shadow-lg flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: 'hidden' }}>
                    <span className="text-xs font-bold text-accent-primary uppercase tracking-widest mb-4">Question</span>
                    <p className="text-xl font-bold text-ink-900 text-center">{card.front}</p>
                    <p className="text-xs text-slate-400 mt-6">Click to reveal answer</p>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 bg-accent-primary rounded-2xl shadow-lg flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Answer</span>
                    <p className="text-xl font-bold text-white text-center">{card.back}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button onClick={prev} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-parchment-300 rounded-xl text-sm font-semibold text-ink-800 hover:bg-parchment-50 shadow-sm">
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button onClick={() => removeCard(card.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                <button onClick={next} className="flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-white rounded-xl text-sm font-semibold hover:bg-accent-hover shadow-sm btn-glow">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {showAddCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-ink-900">Add Flashcard</h2>
                <button onClick={() => setShowAddCard(false)} className="text-slate-400 hover:text-ink-900"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={addCard} className="space-y-3">
                <textarea required value={cardForm.front} onChange={(e) => setCardForm((f) => ({ ...f, front: e.target.value }))}
                  placeholder="Question / Front" rows={3} className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent-primary" />
                <textarea required value={cardForm.back} onChange={(e) => setCardForm((f) => ({ ...f, back: e.target.value }))}
                  placeholder="Answer / Back" rows={3} className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent-primary" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddCard(false)} className="px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold">Add Card</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <Layers className="h-7 w-7 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Flashcards</h1>
              <p className="text-ink-800 text-sm">Create decks and study with flip cards.</p>
            </div>
          </div>
          <button onClick={() => setShowAddDeck(true)} className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover btn-glow">
            <Plus className="h-4 w-4" /> New Deck
          </button>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-20">
            <Layers className="h-14 w-14 text-slate-300 mx-auto mb-4" />
            <p className="text-ink-900 font-semibold text-lg mb-1">No decks yet</p>
            <p className="text-ink-800 text-sm mb-6">Create a deck to start studying with flashcards.</p>
            <button onClick={() => setShowAddDeck(true)} className="px-5 py-2.5 bg-accent-primary text-white rounded-lg text-sm font-semibold btn-glow">Create Deck</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <div key={deck.id} className="card-hover bg-white rounded-xl border border-parchment-200 shadow-sm p-5 cursor-pointer group" onClick={() => openDeck(deck)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-accent-primary" />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeDeck(deck.id); }} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-bold text-ink-900 mb-1">{deck.name}</h3>
                {deck.subject && <span className="text-xs bg-indigo-100 text-accent-primary px-2 py-0.5 rounded-full">{deck.subject}</span>}
                <p className="text-sm text-ink-800 mt-3">{deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-ink-900">New Deck</h2>
              <button onClick={() => setShowAddDeck(false)} className="text-slate-400 hover:text-ink-900"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={addDeck} className="space-y-3">
              <input required value={deckForm.name} onChange={(e) => setDeckForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Deck name (e.g. OS Concepts)" className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary" />
              <select value={deckForm.subject} onChange={(e) => setDeckForm((f) => ({ ...f, subject: e.target.value }))}
                className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">Subject (optional)</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddDeck(false)} className="px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
