ORG := index.html src/sources.html
EMACS = emacs
EMACS_OPTS = --batch -f org-html-export-to-html --kill

all: org

#: export org files to HTML
org: index.org src/sources.org
	${EMACS} index.org ${EMACS_OPTS}
	cd src && ${EMACS} sources.org ${EMACS_OPTS}

clean:
	rm -rf ${ORG}