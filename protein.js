document.addEventListener('DOMContentLoaded', function() {
    const dnaSequence = document.getElementById('dnaSequence');
    const analyzeDNA = document.getElementById('analyzeDNA');
    const mutationPosition = document.getElementById('mutationPosition');
    const mutationBase = document.getElementById('mutationBase');
    const applyMutation = document.getElementById('applyMutation');
    const proteinSequence = document.getElementById('proteinSequence');
    const proteinStructure = document.getElementById('proteinStructure');
    const impactAnalysis = document.getElementById('impactAnalysis');

    const codonTable = {
        'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
        'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
        'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
        'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
        'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
        'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
        'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
        'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
        'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
        'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
        'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
        'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
        'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
        'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
        'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
        'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
    };

    const aminoAcidProperties = {
        'A': 'hydrophobic', 'V': 'hydrophobic', 'I': 'hydrophobic', 'L': 'hydrophobic',
        'M': 'hydrophobic', 'F': 'hydrophobic', 'W': 'hydrophobic', 'G': 'special',
        'S': 'hydrophilic', 'T': 'hydrophilic', 'C': 'hydrophilic', 'Y': 'hydrophilic',
        'N': 'hydrophilic', 'Q': 'hydrophilic', 'D': 'charged', 'E': 'charged',
        'K': 'charged', 'R': 'charged', 'H': 'charged', 'P': 'special'
    };

    analyzeDNA.addEventListener('click', function() {
        const dna = dnaSequence.value.toUpperCase().replace(/[^ATCG]/g, '');
        if (dna.length === 0) {
            alert('Please enter a valid DNA sequence.');
            return;
        }
        const protein = translateDNA(dna);
        displayProteinSequence(protein);
        visualizeProteinStructure(protein);
        analyzeProteinImpact(protein);
    });

    applyMutation.addEventListener('click', function() {
        const dna = dnaSequence.value.toUpperCase().replace(/[^ATCG]/g, '');
        const position = parseInt(mutationPosition.value) - 1;
        const newBase = mutationBase.value;

        if (isNaN(position) || position < 0 || position >= dna.length) {
            alert('Invalid mutation position.');
            return;
        }

        const mutatedDNA = dna.substring(0, position) + newBase + dna.substring(position + 1);
        dnaSequence.value = mutatedDNA;
        
        const originalProtein = translateDNA(dna);
        const mutatedProtein = translateDNA(mutatedDNA);
        
        displayProteinSequence(mutatedProtein, originalProtein);
        visualizeProteinStructure(mutatedProtein);
        analyzeProteinImpact(mutatedProtein, originalProtein);
    });

    function translateDNA(dna) {
        let protein = '';
        for (let i = 0; i < dna.length; i += 3) {
            const codon = dna.substr(i, 3);
            if (codon.length === 3) {
                protein += codonTable[codon] || 'X';
            }
        }
        return protein;
    }

    function displayProteinSequence(protein, original = null) {
        let html = '';
        for (let i = 0; i < protein.length; i++) {
            const aminoAcid = protein[i];
            const propertyClass = aminoAcidProperties[aminoAcid] || '';
            const mutationClass = original && original[i] !== aminoAcid ? 'mutation' : '';
            html += `<span class="amino-acid ${propertyClass} ${mutationClass}" title="${aminoAcid}">${aminoAcid}</span>`;
        }
        proteinSequence.innerHTML = html;
    }

    function visualizeProteinStructure(protein) {
        const ctx = proteinStructure.getContext('2d');
        ctx.clearRect(0, 0, proteinStructure.width, proteinStructure.height);

        const width = proteinStructure.width;
        const height = proteinStructure.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();

        for (let i = 0; i < protein.length; i++) {
            const angle = (i / protein.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = getColorForAminoAcid(protein[i]);
            ctx.fill();
        }
    }

    function getColorForAminoAcid(aminoAcid) {
        switch (aminoAcidProperties[aminoAcid]) {
            case 'hydrophobic': return '#FF9999';
            case 'hydrophilic': return '#99CCFF';
            case 'charged': return '#FFFF99';
            case 'special': return '#CC99FF';
            default: return '#CCCCCC';
        }
    }

    function analyzeProteinImpact(protein, original = null) {
        let analysis = '';
        if (original) {
            const differences = protein.split('').filter((aa, index) => aa !== original[index]).length;
            analysis += `<p>Number of amino acid changes: ${differences}</p>`;
            
            if (protein.length !== original.length) {
                analysis += `<p>Protein length changed from ${original.length} to ${protein.length} amino acids.</p>`;
            }
        }

        const properties = {
            hydrophobic: 0,
            hydrophilic: 0,
            charged: 0,
            special: 0
        };

        protein.split('').forEach(aa => {
            const property = aminoAcidProperties[aa];
            if (property) properties[property]++;
        });

        analysis += '<p>Amino acid composition:</p>';
        analysis += `<ul>
            <li>Hydrophobic: ${properties.hydrophobic}</li>
            <li>Hydrophilic: ${properties.hydrophilic}</li>
            <li>Charged: ${properties.charged}</li>
            <li>Special: ${properties.special}</li>
        </ul>`;

        impactAnalysis.innerHTML = analysis;
    }
});