document.addEventListener('DOMContentLoaded', function() {
    const dnaInput = document.getElementById('dnaInput');
    const visualizeBtn = document.getElementById('visualizeBtn');
    const generateRandomBtn = document.getElementById('generateRandomBtn');
    const showComplementary = document.getElementById('showComplementary');
    const sequenceInfo = document.getElementById('sequenceInfo');
    const dnaCanvas = document.getElementById('dnaCanvas');
    const ctx = dnaCanvas.getContext('2d');

    let dnaSequence = '';
    let complementarySequence = '';

    visualizeBtn.addEventListener('click', visualizeDNA);
    generateRandomBtn.addEventListener('click', generateRandomDNA);
    showComplementary.addEventListener('change', visualizeDNA);

    function visualizeDNA() {
        dnaSequence = dnaInput.value.toUpperCase().replace(/[^ATCG]/g, '');
        if (dnaSequence.length === 0) {
            alert('Please enter a valid DNA sequence.');
            return;
        }
        complementarySequence = getComplementarySequence(dnaSequence);
        updateSequenceInfo();
        drawDNAHelix();
        updateNucleotideComposition();
        updateCodonUsage();
    }

    function generateRandomDNA() {
        const length = Math.floor(Math.random() * 100) + 50; // Random length between 50 and 149
        const bases = 'ATCG';
        dnaSequence = Array.from({length}, () => bases[Math.floor(Math.random() * 4)]).join('');
        dnaInput.value = dnaSequence;
        visualizeDNA();
    }

    function getComplementarySequence(sequence) {
        const complementMap = {'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'};
        return sequence.split('').map(base => complementMap[base]).join('');
    }

    function updateSequenceInfo() {
        const gcContent = calculateGCContent(dnaSequence);
        const molecularWeight = calculateMolecularWeight(dnaSequence);
        sequenceInfo.innerHTML = `
            <strong>Sequence Length:</strong> ${dnaSequence.length} bp<br>
            <strong>GC Content:</strong> ${gcContent.toFixed(2)}%<br>
            <strong>Molecular Weight:</strong> ${molecularWeight.toFixed(2)} g/mol
        `;
    }

    function calculateGCContent(sequence) {
        const gcCount = (sequence.match(/[GC]/g) || []).length;
        return (gcCount / sequence.length) * 100;
    }

    function calculateMolecularWeight(sequence) {
        const weights = {'A': 313.21, 'T': 304.2, 'C': 289.18, 'G': 329.21};
        return sequence.split('').reduce((sum, base) => sum + weights[base], 0);
    }

    function drawDNAHelix() {
        const width = dnaCanvas.width;
        const height = dnaCanvas.height;
        ctx.clearRect(0, 0, width, height);

        const baseColors = {'A': '#FF6B6B', 'T': '#4ECDC4', 'C': '#45B7D1', 'G': '#FFA07A'};
        const baseWidth = width / dnaSequence.length;
        const yCenter = height / 2;
        const amplitude = height / 4;
        const frequency = 0.5;

        for (let i = 0; i < dnaSequence.length; i++) {
            const x = i * baseWidth;
            const y1 = yCenter + Math.sin(i * frequency) * amplitude;
            const y2 = yCenter - Math.sin(i * frequency) * amplitude;

            // Draw backbone
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.strokeStyle = '#ccc';
            ctx.stroke();

            // Draw bases
            ctx.fillStyle = baseColors[dnaSequence[i]];
            ctx.fillRect(x, y1 - 10, baseWidth, 20);

            if (showComplementary.checked) {
                ctx.fillStyle = baseColors[complementarySequence[i]];
                ctx.fillRect(x, y2 - 10, baseWidth, 20);
            }
        }
    }

    function updateNucleotideComposition() {
        const composition = {'A': 0, 'T': 0, 'C': 0, 'G': 0};
        dnaSequence.split('').forEach(base => composition[base]++);

        const ctx = document.getElementById('compositionChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(composition),
                datasets: [{
                    data: Object.values(composition),
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Nucleotide Composition'
                    }
                }
            }
        });
    }

    function updateCodonUsage() {
        const codonUsage = {};
        for (let i = 0; i < dnaSequence.length - 2; i += 3) {
            const codon = dnaSequence.substr(i, 3);
            codonUsage[codon] = (codonUsage[codon] || 0) + 1;
        }

        const codonUsageElement = document.getElementById('codonUsage');
        codonUsageElement.innerHTML = '';
        Object.entries(codonUsage).forEach(([codon, count]) => {
            const codonItem = document.createElement('div');
            codonItem.className = 'codon-item';
            codonItem.textContent = `${codon}: ${count}`;
            codonUsageElement.appendChild(codonItem);
        });
    }
});