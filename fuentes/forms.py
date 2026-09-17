# -*- coding: utf-8 -*-
"""Que forma le toca a cada una de las cinco oraciones de cada trial.

Regla del profesor: cinco oraciones por trial, y entre las cinco tiene que
haber al menos una afirmativa, una negativa y una interrogativa. Las otras
dos quedan repartidas para que ningun trial se parezca al anterior.
"""

AFF, NEG, QUE = "affirmative", "negative", "question"

# ---- las cinco puertas con las oraciones del libro ----
FORMS = {
(2,1): [AFF, NEG, QUE, AFF, NEG],
(2,2): [NEG, AFF, QUE, AFF, QUE],
(3,1): [AFF, QUE, NEG, AFF, QUE],
(3,2): [NEG, AFF, AFF, QUE, NEG],
(4,1): [QUE, AFF, NEG, AFF, NEG],
(4,2): [AFF, NEG, QUE, NEG, AFF],
(5,1): [AFF, NEG, AFF, QUE, NEG],
(5,2): [QUE, AFF, NEG, AFF, QUE],
(6,1): [NEG, AFF, QUE, NEG, AFF],
(6,2): [AFF, QUE, NEG, AFF, QUE],
}

# ---- las dos puertas de escritura propia ----
# (forma, arranque que ya viene escrito, signo final)
# El alumno completa el participio y el resto: no arma la oracion de cero.
STARTERS = {
(1,1): [(AFF, u"I have", u"."),
        (NEG, u"My brother hasn’t", u"."),
        (QUE, u"Have you ever", u"?"),
        (AFF, u"My friends have", u"."),
        (NEG, u"We haven’t", u".")],
(1,2): [(AFF, u"My sister has", u"."),
        (QUE, u"Has your team ever", u"?"),
        (NEG, u"I haven’t", u"."),
        (QUE, u"Have your parents ever", u"?"),
        (AFF, u"We have", u".")],
(7,1): [(AFF, u"I have", u"."),
        (NEG, u"My cousin hasn’t", u"."),
        (QUE, u"Have you ever", u"?"),
        (AFF, u"My grandmother has", u"."),
        (QUE, u"Has your brother ever", u"?")],
(7,2): [(NEG, u"I haven’t", u"."),
        (AFF, u"My best friend has", u"."),
        (QUE, u"Have you ever", u"?"),
        (NEG, u"We haven’t", u"."),
        (AFF, u"The children have", u".")],
}

# Lo que se le agrega al why segun la forma que le toco a la oracion
EXTRA_WHY = {
 AFF: u"",
 NEG: u" In the negative, have or has takes n't and the past participle does not change at all.",
 QUE: u" In the question, Have or Has jumps to the front of the sentence and the past participle stays exactly the same.",
}
