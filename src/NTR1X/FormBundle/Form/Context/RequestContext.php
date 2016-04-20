<?php

namespace NTR1X\FormBundle\Form\Context;

use Symfony\Component\HttpFoundation\Request;

class RequestContext {

	public $path;
	public $get;
	public $request;
	public $session;
	public $headers;
	public $cookies;
	public $files;
	public $content;

	public function __construct(Request $request) {

		$this->path = $request->attributes->get('_route_params');
		$this->get = $request->query->all();
		$this->request = $request->request->all();
		$this->session = $request->getSession()->all();
		$this->headers = $request->headers->all();
		$this->cookies = $request->cookies->all();
		$this->files = $request->files->all();

		if ($request->headers->get('Content-Type') == 'application/json') {
			$this->content = json_decode($request->getContent(), true);
		} else {
			$this->content = $request->getContent();
		}
	}

	public function toArray() {
		return array(
			'path' => $this->path,
			'get' => $this->get,
			'request' => $this->request,
			'session' => $this->session,
			'headers' => $this->headers,
			'cookies' => $this->cookies,
			'files' => $this->files,
			'content' => $this->content,
		);
	}
}