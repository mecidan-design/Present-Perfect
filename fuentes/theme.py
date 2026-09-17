# -*- coding: utf-8 -*-
"""Nombres, URLs y copetes de las siete puertas.

Todo lo que ve el alumno esta en el mundo de la quest: nada de "worksheet",
"photocopy", "mini test" ni "6th form" en el texto corrido. El numero de la
puerta (Gate I ... Gate VII) sigue el orden de los mini tests del profesor,
asi que Gate III es el mini test 3.
"""

GATES = {
1: dict(slug="gate-of-beginnings", roman="I", title=u"The Gate of Beginnings",
        range=u"from BE to CHOOSE",
        copete=u"Every quest starts at a gate, and this one holds the first twelve verbs of the list. "
               u"Put the missing forms back in the table, and then write your own sentences to open it."),
2: dict(slug="hall-of-hunger", roman="II", title=u"The Hall of Hunger",
        range=u"from COME to FEEL",
        copete=u"In this hall everything is eaten, drunk, cut or felt. Ten verbs are waiting in the table, "
               u"and five sentences need the present perfect before the door will move."),
3: dict(slug="forest-of-finding", roman="III", title=u"The Forest of Finding",
        range=u"from FIGHT to HIDE",
        copete=u"Things get lost and found in this forest: a phone, a folder, a plane in the sky and a father "
               u"who has gone shopping. Find the missing forms first, and then the missing verbs."),
4: dict(slug="keep-of-stone", roman="IV", title=u"The Keep of Stone",
        range=u"from HIT to PUT",
        copete=u"Many of the verbs in this keep are made of stone: hit, hurt, let and put never change at all. "
               u"The only clue you get is the have or the has standing in front of them."),
5: dict(slug="tower-of-bells", roman="V", title=u"The Tower of Bells",
        range=u"from RIDE to SIT",
        copete=u"A bell has rung somewhere above you, somebody has sung a new song and somebody else has ridden "
               u"away on a horse. The longest tables of the quest are waiting at the top of this tower."),
6: dict(slug="summit-of-words", roman="VI", title=u"The Summit of Words",
        range=u"from SPEAK to WRITE",
        copete=u"The last climb, where everything is spoken, told, taught and written. Sixteen verbs stand "
               u"between you and the summit, and none of them is easy."),
7: dict(slug="dragons-hoard", roman="VII", title=u"The Dragon's Hoard",
        range=u"every verb of the quest",
        copete=u"The hoard holds every verb of the quest at once. Complete the table, write five sentences of "
               u"your own in the three shapes, and the treasure is yours."),
}

# Tres modelos, uno por forma, para cada ejercicio de escritura libre
MODELS = {
 (1,1): [("affirmative", u"I have broken my glasses twice this year."),
         ("negative",    u"My brother has not bought a new bike."),
         ("question",    u"Have you ever caught a very big fish?")],
 (1,2): [("affirmative", u"My brother has caught a very big fish."),
         ("negative",    u"We have not begun the new book."),
         ("question",    u"Has your team ever beaten that school?")],
 (7,1): [("affirmative", u"My grandmother has made the best cake in the world."),
         ("negative",    u"I have not ridden a horse in my life."),
         ("question",    u"Have you ever heard this song before?")],
 (7,2): [("affirmative", u"I have forgotten my homework at home again."),
         ("negative",    u"My sister has not done her homework today."),
         ("question",    u"Have you ever met a famous person?")],
}

# Las cinco lineas y la forma que pide cada una
FORM_LINES = [(1,"affirmative"), (2,"affirmative"), (3,"negative"), (4,"negative"), (5,"question")]

HUB = dict(
  slug="seven-gates",
  title=u"The Seven Gates",
  chapter=u"Present Perfect Quest &middot; Stop V",
  copete=u"Seven gates stand between you and the end of the quest, and behind every one of them there is a "
         u"table of verbs with pieces missing. Open them in order or choose the one you need: each gate asks "
         u"for the same three forms, and each gate has two ways through it.",
  verbline=u"infinitive &middot; simple past &middot; past participle",
)

# tarjetas del hub
CARDS = {
1: (u"Twelve verbs, the first ones on the list. Fill in the table and then write five sentences of your own, "
    u"two affirmative, two negative and one question.", [u"12 verbs", u"Table", u"Your own sentences"]),
2: (u"A short table and five sentences about food, drinks and a cut finger. Every verb in brackets has to "
    u"turn into the present perfect.", [u"10 verbs", u"Table", u"5 sentences"]),
3: (u"Seven verbs in the table and five sentences about things that were lost, hidden or flown.",
    [u"12 verbs", u"Table", u"5 sentences"]),
4: (u"Ten verbs, and many of them look exactly the same in the three columns. Read the helper in front "
    u"before you decide.", [u"16 verbs", u"Table", u"5 sentences"]),
5: (u"The longest tables of the quest, plus five sentences with a book, a song, a house and a bell.",
    [u"15 verbs", u"Table", u"5 sentences"]),
6: (u"The end of the list: speak, steal, swim, teach, throw, understand and everything in between.",
    [u"16 verbs", u"Table", u"5 sentences"]),
7: (u"Verbs from every corner of the quest, and then five sentences of your own in the three shapes.",
    [u"All the verbs", u"Table", u"Your own sentences"]),
}
