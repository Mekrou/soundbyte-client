import React, { useState, useMemo, useEffect } from "react"
import { matchSorter } from "match-sorter";
import axios from "axios";

export type Soundbyte = {
    id: number,
    name: string,
    filePath: string
}

export type SoundbytesResponse = Soundbyte[]

export default function SoundbyteSearch() {
    const [query, setQuery] = useState<string>();
    const [soundbytes, setSoundbytes] = useState<Soundbyte[]>();

    // fetch soundbytes on mount
    useEffect(() => {
        async function fetchSoundbytes() {
            const res = await axios.get<SoundbytesResponse>("http://localhost:3000/soundbytes/")
            setSoundbytes(res.data);
        }

        fetchSoundbytes();
    }, []);

    const soundbyteNames = useMemo(() => {
        if (!soundbytes) return;
        return soundbytes.map(sb => sb.name);
    }, [soundbytes]);

    const results = useMemo(() => {
        if (!soundbyteNames || !query) return;
        return matchSorter(soundbyteNames, query);
    }, [query, soundbyteNames]);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search soundbytes..."
                style={{ padding: '10px', width: '300px', fontSize: '16px' }}
            />

            <ul style={{ marginTop: '20px' }}>
                {results?.map(sb => (
                    <li key={sb} style={{ padding: '5px 0' }}>
                        {sb}
                    </li>
                ))}
            </ul>
        </div>
    );
}