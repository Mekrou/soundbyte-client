import React, { useState, useMemo, useEffect, useRef } from "react"
import { matchSorter } from "match-sorter";
import axios from "axios";

export type Soundbyte = {
    id: number,
    name: string,
    filePath: string
}

export type SoundbytesResponse = Soundbyte[]

enum Mode {
    query,
    select
}

export async function onSoundbyteSelect(soundbyte: Soundbyte) {
    await axios.post<{ success: boolean }>(`http://localhost:3000/soundbytes/${soundbyte.id}/play`);
}

export default function SoundbyteSearch() {
    const [query, setQuery] = useState<string>();
    const [mode, setMode] = useState<Mode>(Mode.query);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [soundbytes, setSoundbytes] = useState<Soundbyte[]>();
    const searchInput = useRef<HTMLInputElement>(null);
    const containerDiv = useRef<HTMLDivElement>(null);

    // fetch soundbytes on mount
    useEffect(() => {
        async function fetchSoundbytes() {
            const res = await axios.get<SoundbytesResponse>("http://localhost:3000/soundbytes/")
            setSoundbytes(res.data);
        }

        fetchSoundbytes();
    }, []);

    const results = useMemo(() => {
        if (!soundbytes || !query) return;
        return matchSorter(soundbytes, query, { keys: ['name'] });
    }, [query, soundbytes]);

    useEffect(() => {
        window.electronAPI.onFocusInput(() => {
            if (searchInput.current) searchInput.current.focus();
        });
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (mode === Mode.query) {
            console.log(`Query mode`)
            if (e.key === 'Enter') {
                // Enter → switch to select mode
                e.preventDefault();
                setMode(Mode.select);
                setSelectedIndex(0); // highlight first result
                containerDiv?.current.focus();
            }
        } else if (mode === Mode.select) {
            console.log(`Select mode`)
            if (e.key === 'Enter') {
                e.preventDefault();
                onSoundbyteSelect(results[selectedIndex]);
            } else if (e.key.toLowerCase() === 'j' || e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
            } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key == "Escape") {
                e.preventDefault()
                setMode(Mode.query);
                setSelectedIndex(-1); // remove highlight
                searchInput?.current.focus();
            }
        }
    }
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            ref={containerDiv}>
            <input
                type="text"
                ref={searchInput}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search soundbytes..."
                style={{ padding: '10px', width: '300px', fontSize: '16px' }}
            />

            <ul style={{
                marginTop: '20px',
                listStyle: 'none',
                padding: 0,
                margin: 0
            }}>
                {results?.map((sb, index) => (
                    <li
                        key={sb.name}
                        style={{
                            padding: '5px 0',
                            background: index === selectedIndex ? '#555' : 'transparent',
                            borderRadius: '4px'
                        }}>
                        {sb.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};