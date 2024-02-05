/*Vi laver en enkelt app for hele Web-applikationen.. Derfor IKKE 
    const <appnavn> = Vue.createApp({...*/

/// CORS:
/// Cross Origin Resource Sharing, is an HTTP-header based mechanism that allows
/// a server to indicate any origins (domain, scheme, ...)


const baseUrl = "https://mf-REST-Book.azurewebsites.net/api/Book"
//const baseUrl = "http://anbo-bookstorerest.azurewebsites.net/api/books"         // BAD CORS
//const baseUrl = "https://anbo-restbookquerystring.azurewebsites.net/api/Books"  // GOOD CORS


Vue.createApp({
    data() {
        return {
            bookList: [],
            originalBookList: [], // Til at gemme den oprindelige liste
            singleBook: null,
            byTitle: "",
            addData: { title: "", price: null },
            updData: { id: null, title: "", price: null },
            getAllStatMsg: "",
            getByTitStatMsg: "",
            delStatMsg: "",
            addStatMsg: "",
            updStatMsg: "",
            getIdStatMsg: "",
            minPrice: null,
            maxPrice: null,
        }
    },
    /*Created Lifecycle Hook: (placeret før mehods)
    created-livscyklusmetoden indlæser bøgerne ved oprettelse af appen.
    Dette sikrer, at bøgerne hentes, når siden indlæses*/
    async created() {
        this.getAllBooks(baseUrl);
        this.originalBookList = this.bookList.slice(); // Kopier til originalBookList
        this.calculatePriceDistribution(); // Kald denne funktion, når appen oprettes
    },
    methods: {
        clearOutput() {
            this.bookList = []
            this.singleBook = null
            this.getAllStatMsg = ""
            this.getByTitStatMsg = ""
            this.delStatMsg = ""
            this.addStatMsg = ""
            this.updStatMsg = ""
            this.getIdStatMsg = ""
        },
        // async getAll(url) {
        //     try {
        //         const response = await axios.get(url);
        //         this.bookList = await response.data;
        //         //this.originalBookList = this.bookList.slice(); // Gem original liste
        //     } catch (ex) {
        //         alert(ex.message);
        //     }
        // },
        //---: SORTING SECTION :---
        sortById() {
            // https://www.w3schools.com/js/js_array_sort.asp
            this.bookList.sort((book1, book2) => book1.id - book2.id)
        },
        sortByTitle() {
            this.bookList.sort((book1, book2) => book1.title.localeCompare(book2.title))
        },
        sortByPriceAscending() {
            this.bookList.sort((book1, book2) => book1.price - book2.price)
        },
        sortByPriceDescending() {
            this.bookList.sort((book1, book2) => book2.price - book1.price)
        },
        // filterByTitle(title) {
        //     console.log("Title: " + title)
        //     this.bookList = this.bookList.filter(b => b.title.includes(title))
        //     console.log("Books: " + this.bookList)
        // },        
        filterByTitle() {
            const filteredBooks = this.originalBookList.filter(book => book.title.toLowerCase().includes(this.byTitle.toLowerCase()));
            this.bookList = filteredBooks;
        },
        // resetFilter() {
        //     this.bookList = this.originalBookList.slice();
        //     this.byTitle = "";
        // },
        filterByPrice() {
            if (this.minPrice !== null && this.maxPrice !== null) {
                const filteredBooks = this.originalBookList.filter(
                    book => book.price >= this.minPrice && book.price <= this.maxPrice
                );
                this.bookList = filteredBooks;
            } else if (this.minPrice !== null) { // Hvis kun minPrice er udfyldt
                const filteredBooks = this.originalBookList.filter(
                    book => book.price >= this.minPrice
                );
                this.bookList = filteredBooks;
            } else if (this.maxPrice !== null) { // Hvis kun maxPrice er udfyldt
                const filteredBooks = this.originalBookList.filter(
                    book => book.price <= this.maxPrice
                );
                this.bookList = filteredBooks;
            } else { // Hvis ingen af felterne er udfyldt, viser du den oprindelige liste
                this.bookList = this.originalBookList;
            }
        },

        //END: SORTING SECTION :---
        async getAllBooks() {
            try {
                //this.clearOutput(); // Nulstil output før ny hentning
                const response = await axios.get(baseUrl);
                this.bookList = await response.data;
                this.originalBookList = this.bookList.slice(); // Gem original liste
                this.getAllStatMsg = `CODE ${response.status}: ${response.statusText}`

                this.calculatePriceDistribution();
            } catch (ex) {
                this.getAllStatMsg = `ERROR: ${ex.message}`;
                //alert(ex.message)
            }
        },
        async getByTitle(title) {
            try {
                const url = baseUrl + "?title=" + title;
                this.clearOutput();
                const response = await axios.get(url);
                this.bookList = response.data;

                //I mange API'er er det almindeligt at returnere en tom liste ([]) som et gyldigt svar, når ingen elementer opfylder kriterierne.
                if (this.bookList.length > 0) {
                    this.getByTitStatMsg = `CODE ${response.status}: ${response.statusText}`;
                } else {
                    this.getByTitStatMsg = `CODE 404: Not Found`;
                }
            } catch (ex) {
                this.getByTitStatMsg = `ERROR: ${ex.message}`;
                alert(ex.message);
            }
        },
        async getById(id) {
            const url = baseUrl + "/" + id
            try {
                const response = await axios.get(url)
                this.singleBook = await response.data
                this.getIdStatMsg = `CODE ${response.status}: ${response.statusText}`
            } catch (ex) {
                this.singleBook = "";
                this.getIdStatMsg = `ERROR: ${ex.message}, No book with this ID exists`;
                //alert(ex.message)
            }
        },
        async addBook() {
            try {
                response = await axios.post(baseUrl, this.addData)
                this.addStatMsg = `CODE ${response.status}: ${response.statusText}`
                this.getAllBooks()
            } catch (ex) {
                this.addStatMsg = `ERROR: ${ex.response}`
                // this.addStatMsg = `ERROR: ${ex.message}`;
                console.log;

                //alert(ex.message)
            }
        },
        async updateBook(id) {       // ok kode
            const url = baseUrl + "/" + id
            try {
                const response = await axios.put(url, this.updData)
                this.updStatMsg = `CODE ${response.status}: ${response.statusText}`
                this.getAllBooks()
            } catch (ex) {
                this.updStatMsg
                //alert(ex.message)     //Hvad vil vi ha'? Pop-up eller fejlbesked?

            }
        },
        async deleteBook(id) {
            const url = baseUrl + "/" + id
            try {
                response = await axios.delete(url)
                this.delStatMsg = `CODE ${response.status}: ${response.statusText}`
                this.getAllBooks()
            } catch (ex) {
                this.delStatMsg
                //alert(ex.message)
            }
        },
        // Funktion til at beregne prisfordelingen
        calculatePriceDistribution() {
            if (this.myChart) {
                this.myChart.destroy();
            }

            const ctx = document.getElementById('myChart').getContext('2d');

            // Hent data fra bøgerne og opdel dem i prisniveauer
            const prices = this.bookList.map(book => book.price);
            const maxPrice = Math.max(...prices);
            const minPrice = Math.min(...prices); //Beregner den laveste pris i prices-arrayen.
            const priceStep = 100; // Intervallet for prisniveauer
            const priceLabels = [];
            const priceData = [];

            // Opretter prisintervaller ved at filtrere bøgerne efter pris og tæller antallet af bøger i hvert interval.
            for (let i = Math.floor(minPrice / priceStep) * priceStep; i <= maxPrice; i += priceStep) {
                const upperBound = i + priceStep;
                const booksInPriceRange = this.bookList.filter(book => book.price >= i && book.price < upperBound);
                priceLabels.push(`${i} - ${upperBound - 1} kr`); // Viser intervallet for hundreder af priser
                priceData.push(booksInPriceRange.length);
            }

            //Rendering af chartet
            this.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: priceLabels,
                    datasets: [{
                        label: 'Price Distribution',
                        data: priceData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        tension: 0.4

                    }]
                },
                options: {
                    scales: {
                        y: {
                            suggestedMax: Math.max(...priceData) + 1, // Y-skalaen sættes højere
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Books'
                            },
                            ticks: {
                                stepSize: 1,
                                //precision: 0 // Sikrer, at der ikke vises decimaler
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Price Range (kr)'
                            }
                        }
                    }
                }
            });
        },
        //---: DØD KODE, REF OG IDÉER :---
        // async updateBook() {
        //     const url = baseUrl + "/" + this.updData.id
        //     try {
        //         response = await axios.put(url, this.updData)
        //         this.updStatMsg = "CODE " + response.status + ": " + response.statusText
        //         this.getAllBooks()
        //     } catch (ex) {
        //         alert(ex.message)
        //     }
        // },
        // getStatusColor(status) {
        //     if (status >= 200 && status < 300) {
        //         return "text-success";
        //     } else if (status >= 300 && status < 400) {
        //         return "text-info";
        //     } else if (status >= 400 && status < 500) {
        //         return "text-warning";
        //     } else if (status >= 500) {
        //         return "text-danger";
        //     } else {
        //         return "text-dark";
        //     }
        // },
    }
}).mount("#app")