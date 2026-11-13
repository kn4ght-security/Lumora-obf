document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const btn = document.getElementById('obfuscate');

    btn.addEventListener('click', () => {
        const code = input.value.trim();
        if (!code) {
            output.value = '-- Paste some Luau code first';
            return;
        }
        output.value = 'Building better numerical VM...';
        setTimeout(() => {
            output.value = betterNumericalVM(code);
        }, 40);
    });

    input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') btn.click();
    });
});

function betterNumericalVM(source) {
    const k1 = Math.floor(Math.random() * 140) + 60;
    const k2 = Math.floor(Math.random() * 140) + 60;
    const k3 = Math.floor(Math.random() * 140) + 60;
    const realLen = source.length;

    // Triple-layer numerical encoding
    const payload = [];
    for (let i = 0; i < realLen; i++) {
        let b = source.charCodeAt(i) ^ k1;
        b = (b + k2) & 0xFF;
        b = b ^ k3;
        payload.push(b);
    }

    const target = 220000;
    const numbers = [];

    // Stronger header
    numbers.push(0xA1, 0xB2, 0xC3, 0xD4, realLen, k1, k2, k3);

    let p = 0;
    const opcodes = [0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA];
    while (numbers.length < target) {
        if (p < payload.length && Math.random() < 0.12) {
            numbers.push(0x01, payload[p++]);
        } else {
            numbers.push(opcodes[Math.floor(Math.random() * opcodes.length)]);
            numbers.push(Math.floor(Math.random() * 256));
        }
    }
    while (p < payload.length) {
        numbers.push(0x01, payload[p++]);
    }

    const chunk = 20;
    const lines = [];
    for (let i = 0; i < numbers.length; i += chunk) {
        lines.push(numbers.slice(i, i + chunk).join(','));
    }
    const block = lines.join(',\n        ');

    return `--[[
    Lumora Better Numerical VM
    Triple-layer numbers-only payload
]]
local function vm()
    local n = {
        ${block}
    }
    local len = n[5]
    local k1 = n[6]
    local k2 = n[7]
    local k3 = n[8]
    local collected = {}
    local i = 9
    while #collected < len and i <= #n do
        if n[i] == 1 then
            table.insert(collected, n[i + 1])
            i = i + 2
        else
            i = i + 2
        end
    end
    local s = ""
    for j = 1, #collected do
        local b = collected[j]
        b = bit32.bxor(b, k3)
        b = (b - k2) % 256
        s = s .. string.char(bit32.bxor(b, k1))
    end
    local f = loadstring(s)
    if not f then
        error("loadstring disabled - enable LoadStringEnabled")
    end
    return f()
end
return vm()
`;
}