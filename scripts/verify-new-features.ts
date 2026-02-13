import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_BASE = 'http://localhost:3000'; // Assuming local dev server is running

async function testGrantSearch(companyId: string) {
    console.log('Testing Grant Search...');
    try {
        const response = await fetch(`${API_BASE}/api/grants/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId }),
        });
        const data = await response.json();
        console.log('Grant Search Results:', JSON.stringify(data, null, 2));
        return data.suggestions && data.suggestions.length > 0;
    } catch (error) {
        console.error('Grant Search failed:', error);
        return false;
    }
}

async function testDebtCheck(companyId: string) {
    console.log('Testing Debt Check...');
    try {
        const response = await fetch(`${API_BASE}/api/compliance/debts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId }),
        });
        const data = await response.json();
        console.log('Debt Check Results:', JSON.stringify(data, null, 2));
        return data.status !== undefined;
    } catch (error) {
        console.error('Debt Check failed:', error);
        return false;
    }
}

async function runTests() {
    // We need a valid companyId from the database to test
    // For now, this is a placeholder. I will use run_command to get one.
    console.log('Please provide a companyId to run tests.');
}

// runTests();
