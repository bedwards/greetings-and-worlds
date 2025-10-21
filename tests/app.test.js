import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchAPI,
  loadGreetings,
  loadAudiences,
  loadCombos,
  filterCombos,
  addGreeting,
  addAudience,
  createCombo,
  showError
} from '../app.js';

describe('API Functions', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    document.body.innerHTML = `
      <div id="loading-spinner" style="display: none;"></div>
      <div id="greeting-error"></div>
      <div id="audience-error"></div>
      <div id="combo-error"></div>
      <input id="greeting-input" />
      <input id="audience-input" />
      <select id="greeting-select"></select>
      <select id="audience-select"></select>
      <div id="combos-list"></div>
      <input id="filter-input" />
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchAPI should handle successful requests', async () => {
    const mockData = { test: 'data' };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    const result = await fetchAPI('/test');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('fetchAPI should handle errors', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(fetchAPI('/test')).rejects.toThrow('HTTP 404: Not Found');
  });

  it('loadGreetings should populate greetings', async () => {
    const mockGreetings = [
      { id: 1, text: 'Hello' },
      { id: 2, text: 'Hi' }
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockGreetings
    });

    await loadGreetings();

    const select = document.getElementById('greeting-select');
    expect(select.options.length).toBe(3);
    expect(select.options[1].text).toBe('Hello');
    expect(select.options[2].text).toBe('Hi');
  });

  it('loadAudiences should populate audiences', async () => {
    const mockAudiences = [
      { id: 1, text: 'World' },
      { id: 2, text: 'Universe' }
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockAudiences
    });

    await loadAudiences();

    const select = document.getElementById('audience-select');
    expect(select.options.length).toBe(3);
    expect(select.options[1].text).toBe('World');
  });

  it('loadCombos should render combos', async () => {
    const mockCombos = [
      {
        id: 1,
        greeting_id: 1,
        audience_id: 1,
        greeting_text: 'Hello',
        audience_text: 'World'
      }
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockCombos
    });

    await loadCombos();

    const list = document.getElementById('combos-list');
    expect(list.innerHTML).toContain('Hello, World!');
  });

  it('filterCombos should filter by search query', async () => {
    const mockCombos = [
      {
        id: 1,
        greeting_id: 1,
        audience_id: 1,
        greeting_text: 'Hello',
        audience_text: 'World'
      },
      {
        id: 2,
        greeting_id: 2,
        audience_id: 2,
        greeting_text: 'Hi',
        audience_text: 'Universe'
      }
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockCombos
    });

    await loadCombos();
    filterCombos('universe');

    const list = document.getElementById('combos-list');
    expect(list.innerHTML).toContain('Universe');
    expect(list.innerHTML).not.toContain('World');
  });

  it('addGreeting should post new greeting', async () => {
    const input = document.getElementById('greeting-input');
    input.value = 'Howdy';

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3, text: 'Howdy' })
    });

    await addGreeting();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/greetings'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: 'Howdy' })
      })
    );
    expect(input.value).toBe('');
  });

  it('addGreeting should show error for empty input', async () => {
    const input = document.getElementById('greeting-input');
    input.value = '';

    await addGreeting();

    const error = document.getElementById('greeting-error');
    expect(error.textContent).toBe('Please enter a greeting');
  });

  it('addAudience should post new audience', async () => {
    const input = document.getElementById('audience-input');
    input.value = 'Mars';

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 4, text: 'Mars' })
    });

    await addAudience();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/audiences'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: 'Mars' })
      })
    );
  });

  it('createCombo should post new combo', async () => {
    const greetingSelect = document.getElementById('greeting-select');
    const audienceSelect = document.getElementById('audience-select');

    greetingSelect.innerHTML = '<option value="1">Hello</option>';
    audienceSelect.innerHTML = '<option value="2">World</option>';
    greetingSelect.value = '1';
    audienceSelect.value = '2';

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 5, greeting_id: 1, audience_id: 2 })
    });

    await createCombo();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/combos'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ greeting_id: 1, audience_id: 2 })
      })
    );
  });

  it('createCombo should show error if selections missing', async () => {
    await createCombo();

    const error = document.getElementById('combo-error');
    expect(error.textContent).toBe('Please select both greeting and audience');
  });

  it('showError should display and clear error message', () => {
    vi.useFakeTimers();

    showError('greeting-error', 'Test error');

    const error = document.getElementById('greeting-error');
    expect(error.textContent).toBe('Test error');

    vi.advanceTimersByTime(5000);
    expect(error.textContent).toBe('');

    vi.useRealTimers();
  });

  it('should handle API errors gracefully', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await loadGreetings();

    const error = document.getElementById('greeting-error');
    expect(error.textContent).toBe('Failed to load greetings');
  });

  it('should render empty state when no combos', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });

    await loadCombos();

    const list = document.getElementById('combos-list');
    expect(list.innerHTML).toContain('No combos found');
  });
});
