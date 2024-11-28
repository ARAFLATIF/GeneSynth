document.addEventListener('DOMContentLoaded', function() {
    const traitSearch = document.getElementById('traitSearch');
    const traitCategory = document.getElementById('traitCategory');
    const searchButton = document.getElementById('searchButton');
    const traitInfo = document.getElementById('traitInfo');
    const traitList = document.getElementById('traitList');
    const inheritanceChart = document.getElementById('inheritanceChart');
    const geneExpression = document.getElementById('geneExpression');

    let chart = null;

    const traitDatabase = [
        {
            name: "Eye Color",
            category: "physical",
            genes: [
                { name: "OCA2", mutation: "Various SNPs" },
                { name: "HERC2", mutation: "rs12913832" }
            ],
            inheritance: "Polygenic",
            description: "Eye color is determined by multiple genes that influence the production and storage of melanin pigments in the iris. The OCA2 gene produces P-protein, which is involved in melanin production, while HERC2 regulates OCA2 expression.",
            expression: "Continuous variation from light blue to dark brown. The amount and type of melanin in the iris determine the color. Blue eyes have little melanin, while brown eyes have a high concentration.",
            prevalence: "Varies by population. Blue eyes are more common in European populations, while brown eyes are more prevalent worldwide."
        },
        {
            name: "Cystic Fibrosis",
            category: "disease",
            genes: [
                { name: "CFTR", mutation: "ΔF508 (most common)" }
            ],
            inheritance: "Autosomal Recessive",
            description: "Cystic Fibrosis is caused by mutations in the CFTR gene, which codes for a protein that regulates chloride and sodium transport across cell membranes. Mutations lead to thick, sticky mucus in various organs.",
            expression: "Varies from mild to severe, affecting lung function, digestion, and other organ systems. Common symptoms include persistent cough, frequent lung infections, and poor growth.",
            prevalence: "Approximately 1 in 2,500 to 3,500 Caucasian newborns. Less common in other ethnic groups."
        },
        {
            name: "Blood Type",
            category: "biochemical",
            genes: [
                { name: "ABO", mutation: "Various alleles" },
                { name: "RH", mutation: "D antigen presence/absence" }
            ],
            inheritance: "Codominant (ABO) and Dominant (Rh)",
            description: "Blood type is determined by the presence or absence of certain antigens on red blood cells. The ABO gene determines A and B antigens, while the RH gene determines the Rh factor.",
            expression: "Discrete types: A, B, AB, O, each being Rh positive or negative. Influences blood transfusion compatibility and can affect pregnancy.",
            prevalence: "Varies by population. Globally, O is the most common, followed by A, B, and AB."
        },
        {
            name: "Huntington's Disease",
            category: "disease",
            genes: [
                { name: "HTT", mutation: "CAG repeat expansion" }
            ],
            inheritance: "Autosomal Dominant",
            description: "Huntington's Disease is caused by an expansion of CAG repeats in the HTT gene, which codes for the huntingtin protein. The mutated protein leads to neuronal death in specific brain regions.",
            expression: "Progressive neurodegeneration leading to motor, cognitive, and psychiatric symptoms. Typically onset in mid-adulthood.",
            prevalence: "5-10 per 100,000 people of European descent. Less common in other populations."
        },
        {
            name: "Lactose Tolerance",
            category: "biochemical",
            genes: [
                { name: "LCT", mutation: "Various SNPs" }
            ],
            inheritance: "Autosomal Dominant",
            description: "Lactose tolerance is the ability to digest lactose in adulthood, determined by variants in the LCT gene which codes for the lactase enzyme.",
            expression: "Ability to digest milk and dairy products without discomfort in adulthood.",
            prevalence: "Highly variable. Common in populations with a history of dairy farming, less common in others."
        }
    ];

    function displayTraitList(traits) {
        traitList.innerHTML = '';
        if (traits.length === 0) {
            traitList.innerHTML = '<p>No traits found matching your search criteria.</p>';
        } else {
            traits.forEach(trait => {
                const traitElement = document.createElement('div');
                traitElement.classList.add('trait-item');
                traitElement.innerHTML = `
                    <strong>${trait.name}</strong>
                    <span class="inheritance-pattern">(${trait.inheritance})</span>
                `;
                traitElement.addEventListener('click', () => displayTraitInfo(trait));
                traitList.appendChild(traitElement);
            });
        }
    }

    function displayTraitInfo(trait) {
        let geneInfo = trait.genes.map(gene => 
            `<span class="gene-name">${gene.name}</span> <span class="mutation-info">(${gene.mutation})</span>`
        ).join(', ');

        traitInfo.innerHTML = `
            <h4>${trait.name}</h4>
            <p><strong>Category:</strong> ${trait.category}</p>
            <p><strong>Genes Involved:</strong> ${geneInfo}</p>
            <p><strong>Inheritance Pattern:</strong> ${trait.inheritance}</p>
            <p><strong>Description:</strong> ${trait.description}</p>
            <p><strong>Prevalence:</strong> ${trait.prevalence}</p>
        `;
        updateInheritanceChart(trait);
        displayGeneExpression(trait);
    }

    function updateInheritanceChart(trait) {
        if (chart) {
            chart.destroy();
        }

        let data, labels;
        switch (trait.inheritance.toLowerCase()) {
            case 'autosomal dominant':
                data = [75, 25];
                labels = ['Affected', 'Unaffected'];
                break;
            case 'autosomal recessive':
                data = [25, 75];
                labels = ['Affected', 'Unaffected/Carrier'];
                break;
            case 'polygenic':
                data = [30, 40, 30];
                labels = ['Low', 'Medium', 'High'];
                break;
            case 'codominant (abo) and dominant (rh)':
                data = [25, 25, 25, 25];
                labels = ['A', 'B', 'AB', 'O'];
                break;
            default:
                data = [50, 50];
                labels = ['Variant A', 'Variant B'];
        }

        chart = new Chart(inheritanceChart, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'].slice(0, data.length)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Inheritance Pattern: ${trait.inheritance}`
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    function displayGeneExpression(trait) {
        geneExpression.innerHTML = `
            <p><strong>Gene Expression:</strong></p>
            <p>${trait.expression}</p>
        `;
    }

    function performSearch() {
        const searchTerm = traitSearch.value.toLowerCase();
        const category = traitCategory.value;
        const filteredTraits = traitDatabase.filter(trait => 
            (trait.name.toLowerCase().includes(searchTerm) || 
             trait.genes.some(gene => gene.name.toLowerCase().includes(searchTerm)) ||
             trait.description.toLowerCase().includes(searchTerm)) &&
            (category === '' || trait.category === category)
        );
        displayTraitList(filteredTraits);
        
        traitInfo.innerHTML = 'Select a trait to view detailed information.';
        if (chart) {
            chart.destroy();
            chart = null;
        }
        geneExpression.innerHTML = '';
    }

    searchButton.addEventListener('click', performSearch);
    traitSearch.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    displayTraitList(traitDatabase);
});
