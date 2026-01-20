
interface TranslationMap {
    [key: string]: string | TranslationMap;
}

export async function translateObject(
    obj: TranslationMap, 
    targetLang: string
): Promise<TranslationMap> {
    if (!obj) return {};
    
    // Flatten the object to send a single batch request
    const flatMap = flattenObject(obj);
    const keys = Object.keys(flatMap);
    const values = Object.values(flatMap);

    if (values.length === 0) return {};

    try {
        // Send to our internal API
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: values,
                targetLang,
            }),
        });

        if (!response.ok) {
            console.error('Translation failed', await response.text());
            return obj; // Return original on failure
        }

        const data = await response.json();
        const translatedValues = data.translatedText; // Array of strings

        // Reconstruct the object
        const newFlatMap: Record<string, string> = {};
        keys.forEach((key, index) => {
            newFlatMap[key] = translatedValues[index];
        });

        return unflattenObject(newFlatMap);
    } catch (error) {
        console.error('Translation error:', error);
        return obj;
    }
}

function flattenObject(obj: TranslationMap, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            Object.assign(result, flattenObject(value, newKey));
        } else if (typeof value === 'string') {
            result[newKey] = value;
        }
    }
    return result;
}

function unflattenObject(data: Record<string, string>): TranslationMap {
    const result: any = {};
    for (const key in data) {
        const keys = key.split('.');
        let current = result;
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (i === keys.length - 1) {
                current[k] = data[key];
            } else {
                current[k] = current[k] || {};
                current = current[k];
            }
        }
    }
    return result;
}
