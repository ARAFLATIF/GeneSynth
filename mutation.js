document.addEventListener('DOMContentLoaded', function() {
    const originalDNA = document.getElementById('originalDNA');
    const generateRandomDNA = document.getElementById('generateRandomDNA');
    const mutationType = document.getElementById('mutationType');
    const mutationDetails = document.getElementById('mutationDetails');
    const applyMutation = document.getElementById('applyMutation');
    const mutationResults = document.getElementById('mutationResults');
    const mutationImpact = document.getElementById('mutationImpact');

    generateRandomDNA.addEventListener('click', function() {
        const length = Math.floor(Math.random() * 50) + 20; 
        const bases = 'ATCG';
        originalDNA.value = Array.from({length}, () => bases[Math.floor(Math.random() * 4)]).join('');
    });

    mutationType.addEventListener('change', updateMutationDetails);
    updateMutationDetails(); 

    function updateMutationDetails() {
        let detailsHTML = '';
        switch(mutationType.value) {
            case 'substitution':
                detailsHTML = `
                    <input type="number" id="substitutionPosition" class="form-control mb-2" placeholder="Position">
                    <select id="substitutionBase" class="form-select">
                        <option value="A">A</option>
                        <option value="T">T</option>
                        <option value="C">C</option>
                        <option value="G">G</option>
                    </select>
                `;
                break;
            case 'insertion':
                detailsHTML = `
                    <input type="number" id="insertionPosition" class="form-control mb-2" placeholder="Position">
                    <input type="text" id="insertionSequence" class="form-control" placeholder="Sequence to insert">
                `;
                break;
            case 'deletion':
                detailsHTML = `
                    <input type="number" id="deletionStart" class="form-control mb-2" placeholder="Start position">
                    <input type="number" id="deletionEnd" class="form-control" placeholder="End position">
                `;
                break;
        }
        mutationDetails.innerHTML = detailsHTML;
    }

    applyMutation.addEventListener('click', function() {
        const sequence = originalDNA.value.toUpperCase();
        let mutatedSequence = '';
        let mutationDescription = '';

        switch(mutationType.value) {
            case 'substitution':
                const subPosition = parseInt(document.getElementById('substitutionPosition').value) - 1;
                const newBase = document.getElementById('substitutionBase').value;
                mutatedSequence = sequence.substring(0, subPosition) + newBase + sequence.substring(subPosition + 1);
                mutationDescription = `Substitution at position ${subPosition + 1}: ${sequence[subPosition]} → ${newBase}`;
                break;
            case 'insertion':
                const insPosition = parseInt(document.getElementById('insertionPosition').value) - 1;
                const insSequence = document.getElementById('insertionSequence').value.toUpperCase();
                mutatedSequence = sequence.substring(0, insPosition) + insSequence + sequence.substring(insPosition);
                mutationDescription = `Insertion at position ${insPosition + 1}: ${insSequence}`;
                break;
            case 'deletion':
                const delStart = parseInt(document.getElementById('deletionStart').value) - 1;
                const delEnd = parseInt(document.getElementById('deletionEnd').value);
                mutatedSequence = sequence.substring(0, delStart) + sequence.substring(delEnd);
                mutationDescription = `Deletion from position ${delStart + 1} to ${delEnd}`;
                break;
        }

        displayMutationResults(sequence, mutatedSequence, mutationDescription);
        updateNucleotideChart(sequence, mutatedSequence);
        analyzeMutationImpact(sequence, mutatedSequence);
    });

    function displayMutationResults(original, mutated, description) {
        let displayHTML = `
            <p><strong>Original Sequence:</strong> ${original}</p>
            <p><strong>Mutated Sequence:</strong> ${highlightMutation(original, mutated)}</p>
            <p><strong>Mutation:</strong> ${description}</p>
        `;
        mutationResults.innerHTML = displayHTML;
    }

    function highlightMutation(original, mutated) {
        let highlighted = '';
        let i = 0, j = 0;
        while (i < original.length || j < mutated.length) {
            if (original[i] !== mutated[j]) {
                if (j > i) {
                    highlighted += `<span class="insertion">${mutated[j]}</span>`;
                    j++;
                } else if (i > j) {
                    highlighted += `<span class="deletion">${original[i]}</span>`;
                    i++;
                } else {
                    highlighted += `<span class="highlight">${mutated[j]}</span>`;
                    i++;
                    j++;
                }
            } else {
                highlighted += mutated[j];
                i++;
                j++;
            }
        }
        return highlighted;
    }

    function updateNucleotideChart(original, mutated) {
        const ctx = document.getElementById('nucleotideChart').getContext('2d');
        const originalCount = countNucleotides(original);
        const mutatedCount = countNucleotides(mutated);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['A', 'T', 'C', 'G'],
                datasets: [
                    {
                        label: 'Original',
                        data: [originalCount.A, originalCount.T, originalCount.C, originalCount.G],
                        backgroundColor: 'rgba(54, 162, 235, 0.5)'
                    },
                    {
                        label: 'Mutated',
                        data: [mutatedCount.A, mutatedCount.T, mutatedCount.C, mutatedCount.G],
                        backgroundColor: 'rgba(255, 99, 132, 0.5)'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function countNucleotides(sequence) {
        return sequence.split('').reduce((count, nucleotide) => {
            count[nucleotide] = (count[nucleotide] || 0) + 1;
            return count;
        }, {});
    }

    function analyzeMutationImpact(original, mutated) {
        const gcContentOriginal = calculateGCContent(original);
        const gcContentMutated = calculateGCContent(mutated);
        const lengthDifference = mutated.length - original.length;

        let impactHTML = `
            <p><strong>GC Content:</strong> ${gcContentOriginal.toFixed(2)}% → ${gcContentMutated.toFixed(2)}%</p>
            <p><strong>Length Change:</strong> ${lengthDifference > 0 ? '+' : ''}${lengthDifference} bp</p>
            <p><strong>Potential Impact:</strong> ${assessImpact(gcContentOriginal, gcContentMutated, lengthDifference)}</p>
        `;
        mutationImpact.innerHTML = impactHTML;
    }

    function calculateGCContent(sequence) {
        const gcCount = (sequence.match(/[GC]/g) || []).length;
        return (gcCount / sequence.length) * 100;
    }

    function assessImpact(gcOriginal, gcMutated, lengthDiff) {
        let impact = [];
        if (Math.abs(gcMutated - gcOriginal) > 5) {
            impact.push("Significant change in GC content may affect DNA stability and gene expression.");
        }
        if (lengthDiff !== 0) {
            if (lengthDiff % 3 === 0) {
                impact.push("Length change is a multiple of 3, potentially affecting protein length without frameshift.");
            } else {
                impact.push("Length change is not a multiple of 3, likely causing a frameshift mutation.");
            }
        }
        if (impact.length === 0) {
            impact.push("Minimal impact on DNA structure and protein coding.");
        }
        return impact.join(" ");
    }
});
