function formatNumber(num, type) {
    let int, dec;

    num = num.toFixed(2) ;
    num = num.split('.');

    int = num[0];
    dec = num[1];

    int = int.split('');
    for (let i = int.length; i > 0; i-=3 ) {

        if (i !== int.length) {
            int.splice(i, 0, ',');
        }
    }

    int = int.join('');

    type = type === 'inc' ? '+' : '-';

    return `${type} ${int}.${dec}`

};

console.log(formatNumber(1000.435, 'exp'));