ARG PYTHON_DOCKER_VERSION
FROM python:${PYTHON_DOCKER_VERSION}
ADD ./entrypoint.sh /entrypoint.sh
RUN ["chmod", "+x", "/entrypoint.sh"]
ENTRYPOINT ["/bin/sh", "/entrypoint.sh", "$MODE"]
EXPOSE 5000
