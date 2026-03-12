import Case from './src/features/mm/case.js';
import Suspect from './src/features/mm/suspect.js';
import path from 'path';

async function testDynamicResistance() {
    console.log("Starting Dynamic Resistance Test...");

    const caseDir = path.join(process.cwd(), 'data/cases/the_gilded_cage');
    const murderCase = Case.load(caseDir);

    const claraData = murderCase.config.suspects.find(s => s.id === 'clara');
    if (!claraData) {
        console.error("Clara not found in case config!");
        return;
    }

    const suspect = new Suspect(claraData);

    console.log(`Initial Resistance Level: ${suspect.data.resistance_level}`);
    if (suspect.data.resistance_level !== 'expert') {
        console.error("FAIL: Initial resistance level should be 'expert'");
    } else {
        console.log("PASS: Initial resistance level is 'expert'");
    }

    const textMessageSecret = claraData.secrets.find(s => s.id === 'the_text_message');
    if (!textMessageSecret) {
        console.error("the_text_message secret not found!");
        return;
    }

    console.log("Simulating secret reveal...");
    // Since applySecretEffects is private, we'll cast to any to call it for testing
    (suspect as any).applySecretEffects(textMessageSecret);

    console.log(`New Resistance Level: ${suspect.data.resistance_level}`);
    if (suspect.data.resistance_level !== 'low') {
        console.error("FAIL: Resistance level should have dropped to 'low'");
    } else {
        console.log("PASS: Resistance level dropped to 'low'");
    }

    // Verify multipliers
    const oldMultiplier = (suspect as any).getResistanceMultiplier();
    console.log(`Current Multiplier: ${oldMultiplier}`);
    if (oldMultiplier !== 1.0) {
        console.error(`FAIL: Multiplier for 'low' should be 1.0, got ${oldMultiplier}`);
    } else {
        console.log("PASS: Multiplier for 'low' is 1.0");
    }

    console.log("Test Complete.");
}

testDynamicResistance().catch(console.error);
