import {useId, useRef, useState, type FormEvent} from 'react';
import {categories, catalogRentals, type Category, type Rental} from './catalog';
import hero from './assets/photo-img_0787.jpg';
import logo from './assets/ruvi-logo.png';
import './rentals.css';

export type {Rental, Category} from './catalog';

export type RentalInquiry = {
  items: {id: string; name: string; quantity: number; samplePrice?: number}[];
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  venue: string;
};

export type RentalsAppProps = {
  rentals?: readonly Rental[];
  sample?: boolean;
  whatsappUrl?: string;
  instagramUrl?: string;
  onInquiry?: (inquiry: RentalInquiry) => void | string | Promise<void | string>;
};

const formatPrice = new Intl.NumberFormat('en-CA', {style: 'currency', currency: 'CAD', currencyDisplay: 'code'}).format;

export function RentalsApp({rentals = catalogRentals, sample = false, whatsappUrl, instagramUrl, onInquiry}: RentalsAppProps) {
  const [filter, setFilter] = useState<Category | 'All rentals'>('All rentals');
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const catalog = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const galleryHeadingId = useId();
  const galleryDialog = useRef<HTMLDialogElement>(null);
  const galleryOpener = useRef<HTMLButtonElement>(null);
  const [viewing, setViewing] = useState<Rental | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = viewing ? [{image: viewing.image, alt: viewing.alt}, ...(viewing.photos ?? [])] : [];
  const visible = filter === 'All rentals' ? rentals : rentals.filter(item => item.category === filter);
  const cart = rentals.filter(item => selected[item.id] > 0);
  const count = cart.reduce((sum, item) => sum + selected[item.id], 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.samplePrice ?? 0) * selected[item.id], 0);

  function browse() {
    catalog.current?.focus({preventScroll: true});
    catalog.current?.scrollIntoView({block: 'start'});
  }

  function setQuantity(id: string, quantity: number) {
    setFeedback('');
    setSelected(items => ({...items, [id]: Math.max(0, quantity)}));
  }

  async function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.length || sending) return;
    const form = new FormData(event.currentTarget);
    const inquiry: RentalInquiry = {
      items: cart.map(({id, name, samplePrice}) => ({id, name, samplePrice, quantity: selected[id]})),
      name: String(form.get('name')).trim(), email: String(form.get('email')).trim(),
      phone: String(form.get('phone')).trim(), eventDate, venue: venue.trim(),
    };
    if (!onInquiry) return;
    setSending(true);
    setFeedback('');
    try {
      setFeedback(await onInquiry(inquiry) || 'Your inquiry was submitted.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'We couldn’t submit your inquiry. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rb-rentals">
      <header className="rb-header">
        <div className="rb-shell rb-nav">
          <div className="rb-identity">
            <img src={logo} width="1254" height="816" alt="Ruvi Blooms" />
            <span>Event Rentals</span>
          </div>
          <nav aria-label="Rental navigation">
            <button type="button" onClick={browse}>Browse rentals</button>
            <button type="button" className="rb-bag" ref={opener} aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>Rental cart <span>{count}</span></button>
          </nav>
        </div>
      </header>
      <section className="rb-hero" aria-label="Ruvi Blooms event rentals">
        <div className="rb-intro">
          <p className="rb-kicker">Ruvi Blooms Rentals</p>
          <h1>Beautiful things<br /><em>to borrow.</em></h1>
          <p>Loveseats, reusable florals and thoughtful details for weddings and gatherings.</p>
          <button type="button" className="rb-button" onClick={browse}>Explore the rentals</button>
        </div>
        <figure className="rb-hero-image">
          <img src={hero} alt="Cream loveseat and matching chairs framed by flowers" fetchPriority="high" width="1150" height="863" />
          <figcaption>Ruvi Blooms event styling</figcaption>
        </figure>
      </section>
      <section ref={catalog} tabIndex={-1} className="rb-shell rb-catalog" aria-label="Rental catalog">
        <div className="rb-section-head">
          <h2>Explore the collection</h2>
          <p>{sample ? 'Sample inventory and imagery' : 'Pictured styling varies by event'}</p>
        </div>
        <div className="rb-filters" role="group" aria-label="Filter rentals">
          {(['All rentals', ...categories] as const).map(category => (
            <button key={category} type="button" aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>
          ))}
        </div>
        {visible.length ? <ul className="rb-grid">
          {visible.map(item => (
            <li key={item.id} className="rb-card">
              <img src={item.image} alt={item.alt} width="800" height="600" loading="lazy" />
              <div className="rb-card-body">
                <p className="rb-kicker">{item.category}</p>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {item.samplePrice !== undefined && <p className="rb-price"><strong>{formatPrice(item.samplePrice)}</strong> <small>sample price</small></p>}
                <div className="rb-card-actions">
                  {item.photos?.length ? <button type="button" className="rb-card-action" aria-haspopup="dialog"
                    aria-label={'View photos of ' + item.name}
                    onClick={event => {
                      galleryOpener.current = event.currentTarget;
                      setViewing(item);
                      setPhotoIndex(0);
                      galleryDialog.current?.showModal();
                    }}>View photos ({item.photos.length + 1})</button> : null}
                  <button type="button" className="rb-card-action" onClick={() => setQuantity(item.id, (selected[item.id] ?? 0) + 1)}>
                    Add to cart<span className="rb-sr"> — {item.name}</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul> : <p>No rentals in this category yet.</p>}
      </section>
      <footer className="rb-footer">
        <div className="rb-shell"><span>Ruvi Blooms Rentals</span><button type="button" onClick={browse}>Browse rentals</button></div>
      </footer>
      {(whatsappUrl || instagramUrl) && <aside className="rb-social" aria-label="Contact Ruvi Blooms">
        {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Message Ruvi Blooms on WhatsApp">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 19.5 5 16a8.4 8.4 0 1 1 3.1 3l-4.1.5Z"/><path d="M9 8.2c-2.6 2.4 3.2 8 5.9 6.1l.8-.9-2.3-1.2-.8.8a6 6 0 0 1-2.5-2.6l.6-.7-1-2.1-.7.6Z" strokeLinejoin="round"/></svg>
        </a>}
        {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit Ruvi Blooms on Instagram">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.3" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>
        </a>}
      </aside>}
      <dialog ref={galleryDialog} className="rb-dialog rb-gallery-dialog" aria-labelledby={galleryHeadingId}
        onClose={() => galleryOpener.current?.focus()}>
        <div className="rb-dialog-head">
          <h2 id={galleryHeadingId}>{viewing?.name ?? 'Rental photos'}</h2>
          <button type="button" aria-label="Close photos" onClick={() => galleryDialog.current?.close()}>×</button>
        </div>
        {photos[photoIndex] && (
          <figure className="rb-gallery">
            <img src={photos[photoIndex].image} alt={photos[photoIndex].alt} />
            <figcaption className="rb-gallery-controls">
              <button type="button" onClick={() => setPhotoIndex(index => (index - 1 + photos.length) % photos.length)}>Previous photo</button>
              <span role="status">{photoIndex + 1} of {photos.length}</span>
              <button type="button" onClick={() => setPhotoIndex(index => (index + 1) % photos.length)}>Next photo</button>
            </figcaption>
          </figure>
        )}
      </dialog>
      <dialog ref={dialog} className="rb-dialog" aria-labelledby={headingId}
        onClose={() => opener.current?.focus()}>
        <div className="rb-dialog-head">
          <h2 id={headingId}>Your rental cart</h2>
          <button type="button" aria-label="Close rental cart" onClick={() => dialog.current?.close()}>×</button>
        </div>
        {cart.length ? <>
          <ul className="rb-cart-lines">
            {cart.map(item => <li key={item.id}>
              <span>{item.name}{item.samplePrice !== undefined && <small>{formatPrice(item.samplePrice * selected[item.id])} sample</small>}</span>
              <div className="rb-quantity" role="group" aria-label={item.name + " quantity"}>
                <button type="button" aria-label={"Decrease " + item.name + " quantity"} disabled={selected[item.id] === 1} onClick={() => setQuantity(item.id, selected[item.id] - 1)}>−</button>
                <output aria-label="Quantity">{selected[item.id]}</output>
                <button type="button" aria-label={"Increase " + item.name + " quantity"} onClick={() => setQuantity(item.id, selected[item.id] + 1)}>+</button>
              </div>
              <button type="button" aria-label={"Remove " + item.name} onClick={() => setQuantity(item.id, 0)}>Remove</button>
            </li>)}
          </ul>
          {subtotal > 0 && <p className="rb-cart-total">Sample subtotal <strong>{formatPrice(subtotal)}</strong></p>}
          <form className="rb-form" onSubmit={prepare} onChange={() => setFeedback("")}>
            <label>Full name <input name="name" autoComplete="name" maxLength={100} required /></label>
            <label>Email <input name="email" type="email" autoComplete="email" maxLength={150} required /></label>
            <label>Phone (optional) <input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
            <label>Event date <input type="date" value={eventDate} onChange={event => {setEventDate(event.target.value);setFeedback('');}} /></label>
            <label>Venue or city <input value={venue} onChange={event => {setVenue(event.target.value);setFeedback('');}} maxLength={150} /></label>
            {onInquiry ? <button className="rb-button" type="submit" disabled={sending}>{sending ? "Sending…" : "Send inquiry"}</button> : <p>Inquiry submission is unavailable here.</p>}
          </form>
        </> : <p>Your cart is empty. Add a rental to start an inquiry.</p>}
        <p role="status">{feedback}</p>
      </dialog>
    </div>
  );
}
