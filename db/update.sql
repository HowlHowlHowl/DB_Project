UPDATE prodotto
SET valore_di_impatto = (
    select i.acqua * 1.15e4 +
            i.CO2 * 8.4e3 +
            (i.terra * 79) * 1.4e6 +
            (i.eutr) * 7.34e-1 +
            (i.acid * 1000 / 32) * 5.55e1
    from impatto_prodotto as i
    where i.EAN = prodotto.EAN
)