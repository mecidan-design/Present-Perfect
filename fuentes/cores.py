# -*- coding: utf-8 -*-
"""El nucleo de cada oracion, para poder pedirla tambien en negativa y en pregunta.

Las oraciones de la hoja traen cola ("...! He is so tired!"), y esa cola no
entra en la transformacion: la negativa y la pregunta se arman solo con el
nucleo. Por cada item guardamos:

    (sujeto tal como va en la afirmativa,
     sujeto tal como va DENTRO de la pregunta,
     lo que sigue al participio)

El sujeto de la pregunta se escribe aparte en vez de calcularlo, porque
"My dad" baja a minuscula y "Mati" no. El sujeto NO cambia de persona: la
pregunta es una transformacion de orden, nada mas.
"""

CORES = {
# ---------------- Gate II (mini test 2) ----------------
(2,1): [ (u"My dad",           u"my dad",           u"for 4 hours"),
         (u"They",             u"they",             u"from the stairs"),
         (u"My sister",        u"my sister",        u"all the orange juice"),
         (u"All the students", u"all the students", u"beautiful pictures"),
         (u"Mati",             u"Mati",             u"his finger") ],
(2,2): [ (u"My sister",        u"my sister",        u"all my sweets"),
         (u"The students",     u"the students",     u"all their homework"),
         (u"Peter",            u"Peter",            u"three glasses of water"),
         (u"I",                u"I",                u"back to school"),
         (u"I",                u"I",                u"very sick all day") ],
# ---------------- Gate III (mini test 3) ----------------
(3,1): [ (u"I",                u"I",                u"my phone"),
         (u"My little sister", u"my little sister", u"so much"),
         (u"I",                u"I",                u"my friend’s folder"),
         (u"The plane",        u"the plane",        u"for ten hours"),
         (u"He",               u"he",               u"shopping") ],
(3,2): [ (u"I",                u"I",                u"with my best friend"),
         (u"Peter and tom",    u"Peter and tom",    u"sushi"),
         (u"The children",     u"the children",     u"a wonderful story"),
         (u"The teacher",      u"the teacher",      u"his marker"),
         (u"My mum",           u"my mum",           u"her coat behind the door") ],
# ---------------- Gate IV (mini test 4) ----------------
(4,1): [ (u"I",                u"I",                u"my knee"),
         (u"She",              u"she",              u"her husband for a long time"),
         (u"I",                u"I",                u"it"),
         (u"Mary",             u"Mary",             u"all her promises"),
         (u"I",                u"I",                u"for a new one") ],
(4,2): [ (u"My mum",           u"my mum",           u"a wonderful cake for me"),
         (u"I",                u"I",                u"it in my locker"),
         (u"He",               u"he",               u""),
         (u"The teacher",      u"the teacher",      u"us play ping-pong"),
         (u"The band",         u"the band",         u"all the concerts") ],
# ---------------- Gate V (mini test 5) ----------------
(5,1): [ (u"We",               u"we",               u"a great book"),
         (u"Tini",             u"Tini",             u"a new song"),
         (u"He",               u"he",               u"his house"),
         (u"The athletes",     u"the athletes",     u"a 5km marathon"),
         (u"The bell",         u"the bell",         u"") ],
(5,2): [ (u"She",              u"she",              u"me an e-mail"),
         (u"I",                u"I",                u"a horse"),
         (u"I",                u"I",                u"you at the shopping centre"),
         (u"You",              u"you",              u"me the picture"),
         (u"The teacher",      u"the teacher",      u"that we are having a test") ],
# ---------------- Gate VI (mini test 6) ----------------
(6,1): [ (u"I",                u"I",                u"at a five-star hotel"),
         (u"The famous author",u"the famous author",u"a new book"),
         (u"Somebody",         u"somebody",         u"my wallet"),
         (u"Jenny",            u"Jenny",            u"a beautiful dress to the party"),
         (u"I",                u"I",                u"up at 5am") ],
(6,2): [ (u"That fantastic actress", u"that fantastic actress", u"an Oscar"),
         (u"We",               u"we",               u"in the ocean"),
         (u"Our English teacher", u"our English teacher", u"a new topic"),
         (u"The basketball player", u"the basketball player", u"the ball"),
         (u"My dad",           u"my dad",           u"me to school") ],
}
