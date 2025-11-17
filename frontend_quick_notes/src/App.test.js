import { NotesRepository } from './services/notesRepository';

describe('NotesRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('create and list notes', () => {
    const repo = new NotesRepository();
    const note = repo.create({ title: 'Test', content: 'Hello' });
    expect(note.id).toBeTruthy();
    const all = repo.list();
    expect(all.length).toBe(1);
    expect(all[0].title).toBe('Test');
  });

  test('search notes by query', () => {
    const repo = new NotesRepository();
    repo.create({ title: 'Alpha', content: 'First' });
    repo.create({ title: 'Beta', content: 'Second' });
    const res = repo.list('alp');
    expect(res.length).toBe(1);
    expect(res[0].title).toBe('Alpha');
  });

  test('update and remove notes', () => {
    const repo = new NotesRepository();
    const note = repo.create({ title: 'Old', content: '' });
    const updated = repo.update(note.id, { title: 'New' });
    expect(updated.title).toBe('New');
    const removed = repo.remove(note.id);
    expect(removed).toBe(true);
    expect(repo.list().length).toBe(0);
  });
});
